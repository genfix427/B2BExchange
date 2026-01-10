// controllers/store/order.controller.js - FIXED VERSION
import Order from '../../models/Order.model.js';
import Cart from '../../models/Cart.model.js';
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';

// @desc    Create order from cart
// @route   POST /api/store/orders
// @access  Private (Vendor as Customer)
export const createOrder = async (req, res, next) => {
  try {
    const { paymentMethod, notes } = req.body;
    
    // ✅ Get vendor info (who is buying)
    const customer = await Vendor.findById(req.user.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Get cart with populated product info
    const cart = await Cart.findOne({ customer: req.user.id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Group items by vendor (seller) and validate stock
    const itemsByVendor = {};
    let subtotal = 0;
    const vendorOrders = [];
    
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found in cart'
        });
      }
      
      // Check stock
      if (product.quantityInStock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}. Available: ${product.quantityInStock}`
        });
      }
      
      // Calculate prices
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;
      
      // Prepare order item
      const orderItem = {
        product: product._id,
        productName: product.productName,
        ndcNumber: product.ndcNumber,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        vendor: product.vendor, // This is the SELLER vendor
        vendorName: product.vendorName
      };
      
      // Group by seller vendor
      const sellerVendorId = product.vendor.toString();
      if (!itemsByVendor[sellerVendorId]) {
        itemsByVendor[sellerVendorId] = {
          vendor: product.vendor,
          vendorName: product.vendorName,
          items: []
        };
        
        // Create vendor order entry for seller
        vendorOrders.push({
          vendor: product.vendor,
          vendorName: product.vendorName,
          status: 'pending'
        });
      }
      
      itemsByVendor[sellerVendorId].items.push(orderItem);
    }
    
    // Prepare all order items
    const orderItems = [];
    for (const sellerVendorId in itemsByVendor) {
      orderItems.push(...itemsByVendor[sellerVendorId].items);
    }
    
    // Calculate totals
    const shippingCost = 0; // Free shipping for B2B
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;
    
    // Get shipping address from buyer vendor's profile
    const shippingAddress = {
      line1: customer.pharmacyInfo.shippingAddress.line1,
      line2: customer.pharmacyInfo.shippingAddress.line2 || '',
      city: customer.pharmacyInfo.shippingAddress.city,
      state: customer.pharmacyInfo.shippingAddress.state,
      zipCode: customer.pharmacyInfo.shippingAddress.zipCode,
      phone: customer.pharmacyInfo.phone
    };
    
    // ✅ Create order with buyer vendor as customer
    const order = await Order.create({
      customer: req.user.id, // This is the BUYER vendor ID
      customerName: customer.pharmacyInfo.legalBusinessName || customer.pharmacyInfo.dba,
      customerEmail: customer.email,
      items: orderItems,
      shippingAddress,
      vendorOrders, // These are for SELLER vendors
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
      status: 'pending'
    });
    
    // Update product stock
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(cartItem.product._id, {
        $inc: { 
          quantityInStock: -cartItem.quantity,
          salesCount: cartItem.quantity 
        }
      });
    }
    
    // Clear cart
    await Cart.findOneAndUpdate(
      { customer: req.user.id },
      { $set: { items: [] } },
      { new: true }
    );
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
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