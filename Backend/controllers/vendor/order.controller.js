// controllers/vendor/order.controller.js
import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.model.js';

// @desc    Get vendor's sales orders
// @route   GET /api/vendor/orders
// @access  Private (Vendor)
export const getVendorOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;
    
    // Find orders where this vendor has items
    const query = {
      'items.vendor': req.user.id
    };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Transform to vendor-specific view
    const vendorOrders = orders.map(order => {
      // Get only this vendor's items
      const vendorItems = order.items.filter(item => 
        item.vendor.toString() === req.user.id.toString()
      );
      
      // Calculate vendor-specific total
      const vendorTotal = vendorItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Get vendor-specific order status
      const vendorOrder = order.vendorOrders.find(vo => 
        vo.vendor.toString() === req.user.id.toString()
      );
      
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: vendorItems,
        total: vendorTotal,
        status: vendorOrder ? vendorOrder.status : 'pending',
        trackingNumber: vendorOrder?.trackingNumber,
        carrier: vendorOrder?.carrier,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: vendorOrders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor order status
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if vendor has items in this order
    const hasVendorItems = order.items.some(item => 
      item.vendor.toString() === req.user.id.toString()
    );
    
    if (!hasVendorItems) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }
    
    // Find or create vendor order entry
    let vendorOrder = order.vendorOrders.find(vo => 
      vo.vendor.toString() === req.user.id.toString()
    );
    
    if (!vendorOrder) {
      vendorOrder = {
        vendor: req.user.id,
        vendorName: req.user.pharmacyInfo?.legalBusinessName || req.user.pharmacyInfo?.dba,
        status: 'pending'
      };
      order.vendorOrders.push(vendorOrder);
    }
    
    // Update status
    vendorOrder.status = status;
    
    if (status === 'shipped' && trackingNumber) {
      vendorOrder.trackingNumber = trackingNumber;
      vendorOrder.carrier = carrier;
      vendorOrder.shippedAt = new Date();
    }
    
    if (status === 'delivered') {
      vendorOrder.deliveredAt = new Date();
    }
    
    // Update main order status if all vendor orders are delivered
    const allDelivered = order.vendorOrders.every(vo => vo.status === 'delivered');
    if (allDelivered) {
      order.status = 'delivered';
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor order details
// @route   GET /api/vendor/orders/:id
// @access  Private (Vendor)
export const getVendorOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email pharmacyInfo.phone')
      .populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if vendor has items in this order
    const vendorItems = order.items.filter(item => 
      item.vendor.toString() === req.user.id.toString()
    );
    
    if (vendorItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }
    
    // Get vendor-specific order status
    const vendorOrder = order.vendorOrders.find(vo => 
      vo.vendor.toString() === req.user.id.toString()
    );
    
    const vendorOrderDetails = {
      ...order.toObject(),
      items: vendorItems,
      vendorStatus: vendorOrder?.status || 'pending',
      trackingNumber: vendorOrder?.trackingNumber,
      carrier: vendorOrder?.carrier,
      shippedAt: vendorOrder?.shippedAt,
      deliveredAt: vendorOrder?.deliveredAt
    };
    
    res.status(200).json({
      success: true,
      data: vendorOrderDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/stats
// @access  Private (Vendor)
export const getVendorStats = async (req, res, next) => {
  try {
    // Sales stats
    const salesStats = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.vendor': req.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.totalPrice' },
          pendingOrders: {
            $sum: { 
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] 
            }
          },
          completedOrders: {
            $sum: { 
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] 
            }
          }
        }
      }
    ]);
    
    // Recent orders
    const recentOrders = await Order.find({
      'items.vendor': req.user.id
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'pharmacyInfo.legalBusinessName');
    
    res.status(200).json({
      success: true,
      data: {
        sales: salesStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};