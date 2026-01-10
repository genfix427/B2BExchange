// controllers/store/checkout.controller.js
import Order from '../../models/Order.model.js';
import Cart from '../../models/Cart.model.js';
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';

// @desc    Create order from cart
// @route   POST /api/store/orders
// @access  Private (Vendor)
export const createOrder = async (req, res, next) => {
  try {
    const { 
      shippingAddressId, 
      shippingAddress,
      paymentMethod,
      notes 
    } = req.body;

    // Get customer info
    const customer = await Vendor.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ customer: req.user.id })
      .populate('items.product', 'productName ndcNumber strength dosageForm manufacturer price image quantityInStock vendor vendorName');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Prepare shipping address
    let finalShippingAddress;
    
    if (shippingAddressId && shippingAddressId !== 'primary') {
      // Use existing address from vendor's shipping addresses
      const address = customer.shippingInfo?.shippingAddresses?.id(shippingAddressId);
      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address not found'
        });
      }
      finalShippingAddress = address.toObject();
      finalShippingAddress.email = customer.email;
    } else if (shippingAddress) {
      // Use new address from request
      finalShippingAddress = shippingAddress;
      finalShippingAddress.email = customer.email;
    } else {
      // Use primary address from vendor info
      finalShippingAddress = {
        contactName: `${customer.pharmacyOwner?.firstName || ''} ${customer.pharmacyOwner?.lastName || ''}`.trim(),
        companyName: customer.pharmacyInfo?.legalBusinessName || customer.pharmacyInfo?.dba || '',
        line1: customer.pharmacyInfo?.businessAddress?.line1 || '',
        line2: customer.pharmacyInfo?.businessAddress?.line2 || '',
        city: customer.pharmacyInfo?.businessAddress?.city || '',
        state: customer.pharmacyInfo?.businessAddress?.state || '',
        zipCode: customer.pharmacyInfo?.businessAddress?.zipCode || '',
        phone: customer.pharmacyInfo?.phone || '',
        email: customer.email || '',
        addressType: 'both',
        isDefault: true
      };
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let subtotal = 0;
    
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      // Check stock
      if (product.quantityInStock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}. Available: ${product.quantityInStock}`
        });
      }
      
      // Calculate item total
      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;
      
      // Create order item
      orderItems.push({
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
        image: product.image || {}
      });
    }

    // Calculate totals
    const shippingCost = 0; // You can implement shipping calculation
    const tax = subtotal * 0.08; // Example: 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order - let the model generate the orderNumber
    const orderData = {
      customer: req.user.id,
      customerName: customer.pharmacyInfo?.legalBusinessName || customer.pharmacyInfo?.dba || 'Unknown',
      customerEmail: customer.email,
      customerPhone: customer.pharmacyInfo?.phone || '',
      items: orderItems,
      shippingAddress: finalShippingAddress,
      paymentMethod: paymentMethod || 'bank_transfer',
      paymentStatus: 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
      status: 'pending'
    };

    console.log('Creating order with data:', { ...orderData, itemsCount: orderItems.length });

    const order = await Order.create(orderData);

    // Clear cart
    await Cart.findOneAndUpdate(
      { customer: req.user.id },
      { $set: { items: [] } }
    );

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'productName ndcNumber image')
      .populate('items.vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create order error details:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    next(error);
  }
};

// @desc    Get shipping addresses
// @route   GET /api/store/shipping-addresses
// @access  Private (Vendor)
export const getShippingAddresses = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id)
      .select('shippingInfo pharmacyInfo pharmacyOwner email');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get primary address from pharmacy info
    const primaryAddress = {
      contactName: `${vendor.pharmacyOwner?.firstName || ''} ${vendor.pharmacyOwner?.lastName || ''}`.trim(),
      companyName: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || '',
      line1: vendor.pharmacyInfo?.businessAddress?.line1 || '',
      line2: vendor.pharmacyInfo?.businessAddress?.line2 || '',
      city: vendor.pharmacyInfo?.businessAddress?.city || '',
      state: vendor.pharmacyInfo?.businessAddress?.state || '',
      zipCode: vendor.pharmacyInfo?.businessAddress?.zipCode || '',
      phone: vendor.pharmacyInfo?.phone || '',
      email: vendor.email || '',
      addressType: 'both',
      _id: 'primary'
    };

    // Check if there's any default address in shipping addresses
    const hasDefaultAddress = vendor.shippingInfo?.shippingAddresses?.some(addr => addr.isDefault) || false;
    primaryAddress.isDefault = !hasDefaultAddress;

    // Get saved shipping addresses
    const savedAddresses = vendor.shippingInfo?.shippingAddresses || [];
    
    // Combine primary address with saved addresses
    const addresses = [primaryAddress, ...savedAddresses.map(addr => ({
      _id: addr._id,
      label: addr.label || 'Address',
      contactName: addr.contactName,
      companyName: addr.companyName,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      phone: addr.phone,
      email: addr.email,
      instructions: addr.instructions,
      addressType: addr.addressType || 'shipping',
      isDefault: addr.isDefault || false,
      createdAt: addr.createdAt
    }))];

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Get shipping addresses error:', error);
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/store/shipping-addresses
// @access  Private (Vendor)
export const addShippingAddress = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Initialize shippingInfo if it doesn't exist
    if (!vendor.shippingInfo) {
      vendor.shippingInfo = {
        shippingAddresses: []
      };
    }

    // Initialize shippingAddresses array if it doesn't exist
    if (!vendor.shippingInfo.shippingAddresses) {
      vendor.shippingInfo.shippingAddresses = [];
    }

    const newAddress = {
      ...req.body,
      email: req.body.email || vendor.email,
      contactName: req.body.contactName || `${vendor.pharmacyOwner?.firstName || ''} ${vendor.pharmacyOwner?.lastName || ''}`.trim()
    };

    // If this is the first address or marked as default, set as default
    if (vendor.shippingInfo.shippingAddresses.length === 0 || newAddress.isDefault) {
      // Remove default flag from existing addresses
      vendor.shippingInfo.shippingAddresses.forEach(addr => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    // Add the new address
    vendor.shippingInfo.shippingAddresses.push(newAddress);
    await vendor.save();

    // Get the newly added address
    const addedAddress = vendor.shippingInfo.shippingAddresses[vendor.shippingInfo.shippingAddresses.length - 1];

    res.status(201).json({
      success: true,
      message: 'Shipping address added successfully',
      data: addedAddress
    });
  } catch (error) {
    console.error('Add shipping address error:', error);
    next(error);
  }
};

// @desc    Update shipping address
// @route   PUT /api/store/shipping-addresses/:id
// @access  Private (Vendor)
export const updateShippingAddress = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if shippingInfo and shippingAddresses exist
    if (!vendor.shippingInfo || !vendor.shippingInfo.shippingAddresses) {
      return res.status(404).json({
        success: false,
        message: 'No shipping addresses found'
      });
    }

    const address = vendor.shippingInfo.shippingAddresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, remove default from others
    if (req.body.isDefault) {
      vendor.shippingInfo.shippingAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address fields
    Object.keys(req.body).forEach(key => {
      if (key in address) {
        address[key] = req.body[key];
      }
    });

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Update shipping address error:', error);
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/store/shipping-addresses/:id
// @access  Private (Vendor)
export const deleteShippingAddress = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if shippingInfo and shippingAddresses exist
    if (!vendor.shippingInfo || !vendor.shippingInfo.shippingAddresses) {
      return res.status(404).json({
        success: false,
        message: 'No shipping addresses found'
      });
    }

    const address = vendor.shippingInfo.shippingAddresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If default address was deleted and there are other addresses, set first as default
    if (wasDefault && vendor.shippingInfo.shippingAddresses.length > 0) {
      vendor.shippingInfo.shippingAddresses[0].isDefault = true;
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Shipping address deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipping address error:', error);
    next(error);
  }
};

// @desc    Set default shipping address
// @route   PUT /api/store/shipping-addresses/:id/default
// @access  Private (Vendor)
export const setDefaultShippingAddress = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if shippingInfo and shippingAddresses exist
    if (!vendor.shippingInfo || !vendor.shippingInfo.shippingAddresses) {
      return res.status(404).json({
        success: false,
        message: 'No shipping addresses found'
      });
    }

    const address = vendor.shippingInfo.shippingAddresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default flag from all addresses
    vendor.shippingInfo.shippingAddresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set this address as default
    address.isDefault = true;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Default shipping address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    next(error);
  }
};