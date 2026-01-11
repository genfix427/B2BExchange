// controllers/store/order.controller.js - FIXED VERSION
import Order from '../../models/Order.model.js';
import Cart from '../../models/Cart.model.js';
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';
import mongoose from 'mongoose';

// Helper function to update product stock with retry logic
const updateProductStock = async (productId, quantity, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Find the product first to check current stock
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      if (product.quantityInStock < quantity) {
        return {
          success: false,
          message: `Insufficient stock. Available: ${product.quantityInStock}, Requested: ${quantity}`,
          available: product.quantityInStock,
          product
        };
      }
      
      // Calculate new stock and status
      const newStock = product.quantityInStock - quantity;
      const newStatus = newStock <= 0 ? 'out_of_stock' : 'active';
      
      // Update product atomically
      const result = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            quantityInStock: newStock,
            status: newStatus,
            updatedAt: new Date()
          },
          $inc: {
            salesCount: quantity
          }
        },
        {
          new: true,
          runValidators: true
        }
      );
      
      if (!result) {
        throw new Error('Failed to update product stock');
      }
      
      return {
        success: true,
        product: result,
        newStock,
        newStatus
      };
      
    } catch (error) {
      console.error(`Stock update attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          message: 'Failed to update stock after multiple attempts',
          error: error.message
        };
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 100));
    }
  }
};

// @desc    Create order from cart with proper stock management
// @route   POST /api/store/orders
// @access  Private (Vendor as Customer)
export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { paymentMethod, notes } = req.body;
    
    // ✅ Get vendor info (who is buying)
    const customer = await Vendor.findById(req.user.id).session(session);
    
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Get cart with populated product info
    const cart = await Cart.findOne({ customer: req.user.id })
      .populate('items.product')
      .session(session);
    
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate all items and reserve stock
    const orderItems = [];
    const vendorOrders = [];
    let subtotal = 0;
    const itemsByVendor = {};
    const stockUpdates = [];
    
    // First, validate stock for all items
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Product not found in cart'
        });
      }
      
      // Check stock availability
      if (product.quantityInStock < cartItem.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}. Available: ${product.quantityInStock}, Requested: ${cartItem.quantity}`
        });
      }
      
      // Add to stock updates
      stockUpdates.push({
        productId: product._id,
        quantity: cartItem.quantity,
        productName: product.productName
      });
      
      // Calculate item total
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;
      
      // Prepare order item
      const orderItem = {
        product: product._id,
        productName: product.productName,
        ndcNumber: product.ndcNumber,
        strength: product.strength,
        dosageForm: product.dosageForm,
        manufacturer: product.manufacturer,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        vendor: product.vendor,
        vendorName: product.vendorName,
        image: product.image
      };
      
      orderItems.push(orderItem);
      
      // Group by seller vendor
      const sellerVendorId = product.vendor.toString();
      if (!itemsByVendor[sellerVendorId]) {
        itemsByVendor[sellerVendorId] = {
          vendor: product.vendor,
          vendorName: product.vendorName,
          items: []
        };
      }
      itemsByVendor[sellerVendorId].items.push(orderItem);
    }
    
    // Update product stocks
    for (const update of stockUpdates) {
      const stockUpdateResult = await updateProductStock(
        update.productId,
        update.quantity
      );
      
      if (!stockUpdateResult.success) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Failed to reserve stock for ${update.productName}. ${stockUpdateResult.message}`
        });
      }
    }
    
    // Create vendor orders for each seller
    for (const sellerVendorId in itemsByVendor) {
      const vendorOrder = itemsByVendor[sellerVendorId];
      const vendorSubtotal = vendorOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      vendorOrders.push({
        vendor: vendorOrder.vendor,
        vendorName: vendorOrder.vendorName,
        status: 'pending',
        subtotal: vendorSubtotal,
        items: vendorOrder.items.map(item => ({
          product: item.product,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      });
    }
    
    // Calculate totals
    const shippingCost = 0; // Free shipping for B2B
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;
    
    // Get shipping address from buyer vendor's profile
    const shippingAddress = {
      line1: customer.pharmacyInfo?.shippingAddress?.line1 || '',
      line2: customer.pharmacyInfo?.shippingAddress?.line2 || '',
      city: customer.pharmacyInfo?.shippingAddress?.city || '',
      state: customer.pharmacyInfo?.shippingAddress?.state || '',
      zipCode: customer.pharmacyInfo?.shippingAddress?.zipCode || '',
      phone: customer.pharmacyInfo?.phone || ''
    };
    
    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // ✅ Create order
    const order = new Order({
      orderNumber,
      customer: req.user.id, // This is the BUYER vendor ID
      customerName: customer.pharmacyInfo?.legalBusinessName || customer.pharmacyInfo?.dba || 'Unknown Vendor',
      customerEmail: customer.email,
      customerPhone: customer.pharmacyInfo?.phone || '',
      items: orderItems,
      shippingAddress,
      vendorOrders,
      paymentMethod: paymentMethod || 'bank_transfer',
      subtotal,
      shippingCost,
      tax,
      total,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    await order.save({ session });
    
    // Clear cart
    await Cart.findOneAndUpdate(
      { customer: req.user.id },
      { $set: { items: [], itemCount: 0, total: 0 } },
      { session, new: true }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    // Populate order for response
    await order.populate('items.vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email phone');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    
    // More specific error messages
    if (error.name === 'MongoServerError' && error.code === 112) {
      return res.status(409).json({
        success: false,
        message: 'Order processing conflict. Please try again.',
        retry: true
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get vendor's purchase orders (where they are the customer/buyer)
// @route   GET /api/store/orders
// @access  Private (Vendor as Customer)
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    // ✅ CRITICAL FIX: Find orders where this vendor is the CUSTOMER (buyer)
    const query = { customer: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'vendorOrders.vendorName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'productName ndcNumber image')
      .populate('vendorOrders.vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email');
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    next(error);
  }
};

// @desc    Get single purchase order
// @route   GET /api/store/orders/:id
// @access  Private (Vendor as Customer)
export const getOrder = async (req, res, next) => {
  try {
    // ✅ Find order where this vendor is the CUSTOMER (buyer)
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    })
    .populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image')
    .populate('vendorOrders.vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email pharmacyInfo.phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    next(error);
  }
};