import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.model.js';
import Product from '../../models/Product.model.js';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// @desc    Get vendor-specific statistics
// @route   GET /api/admin/vendors/:id/orders/stats
// @access  Private (Admin)
export const getVendorOrderStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query; // day, week, month, quarter, year

    // Validate vendor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID format'
      });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Date ranges
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // ✅ FIX: Use mongoose.Types.ObjectId for aggregation
    const vendorObjectId = new mongoose.Types.ObjectId(id);

    // SELL Statistics (Vendor as Seller)
    const sellStats = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.totalPrice' },
          totalItemsSold: { $sum: '$items.quantity' },
          avgOrderValue: { $avg: '$items.totalPrice' }
        }
      }
    ]);

    // Sell status breakdown
    const sellStatusBreakdown = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // PURCHASE Statistics (Vendor as Buyer)
    const purchaseStats = await Order.aggregate([
      {
        $match: {
          customer: vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          maxOrderValue: { $max: '$total' },
          minOrderValue: { $min: '$total' }
        }
      }
    ]);

    // Purchase status breakdown
    const purchaseStatusBreakdown = await Order.aggregate([
      {
        $match: {
          customer: vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$total' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Monthly trend for sell
    const monthlySellTrend = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 },
          items: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top selling products
    const topSellingProducts = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          avgPrice: { $avg: '$items.unitPrice' }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top buying vendors (who buys from this vendor)
    const topBuyingVendors = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.vendor': vendorObjectId, // ✅ Use ObjectId instance
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$customer',
          customerName: { $first: '$customerName' },
          totalPurchases: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $sort: { totalPurchases: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba,
          email: vendor.email
        },
        period,
        dateRange: {
          start: startDate,
          end: new Date()
        },
        sell: {
          summary: sellStats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            totalItemsSold: 0,
            avgOrderValue: 0
          },
          statusBreakdown: sellStatusBreakdown,
          monthlyTrend: monthlySellTrend,
          topProducts: topSellingProducts,
          topCustomers: topBuyingVendors
        },
        purchase: {
          summary: purchaseStats[0] || {
            totalOrders: 0,
            totalSpent: 0,
            avgOrderValue: 0,
            maxOrderValue: 0,
            minOrderValue: 0
          },
          statusBreakdown: purchaseStatusBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Error in getVendorOrderStats:', error);
    next(error);
  }
};

// @desc    Get vendor's sell orders (admin view)
// @route   GET /api/admin/orders/vendors/:id/orders/sell
// @access  Private (Admin)
export const getVendorSellOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    const query = {
      'items.vendor': id
    };
    
    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    // Status filtering
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Transform to show only this vendor's items
    const sellOrders = orders.map(order => {
      const vendorItems = order.items.filter(item => 
        item.vendor.toString() === id.toString()
      );
      
      const vendorTotal = vendorItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const vendorOrder = order.vendorOrders.find(vo => 
        vo.vendor.toString() === id.toString()
      );
      
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: vendorItems,
        itemCount: vendorItems.length,
        total: vendorTotal,
        status: vendorOrder?.status || 'pending',
        vendorStatus: vendorOrder?.status,
        mainOrderStatus: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: vendorOrder?.trackingNumber,
        carrier: vendorOrder?.carrier,
        shippedAt: vendorOrder?.shippedAt,
        deliveredAt: vendorOrder?.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }).filter(order => order.itemCount > 0);
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: sellOrders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sellOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's purchase orders (admin view)
// @route   GET /api/admin/orders/vendors/:id/orders/purchase
// @access  Private (Admin)
export const getVendorPurchaseOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    const query = {
      customer: id
    };
    
    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    // Status filtering
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
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
    next(error);
  }
};

// @desc    Get top vendors
// @route   GET /api/admin/orders/analytics/top-vendors
// @access  Private (Admin)
// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Get total orders count and revenue
    const [totalOrders, totalRevenue, avgOrderValue] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            avg: { $avg: '$total' }
          }
        }
      ])
    ]);

    // Get monthly stats
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Get daily stats
    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Get status breakdown
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Get unique vendors from orders
    const uniqueVendors = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.vendor'
        }
      },
      {
        $count: 'count'
      }
    ]);

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const monthlyTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top performing vendors (by sales)
    const topVendors = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$items.vendor',
          vendorName: { $first: '$items.vendorName' },
          totalSales: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top buying vendors (by purchases)
    const topBuyers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$customer',
          customerName: { $first: '$customerName' },
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba')
      .lean();

    // Enhanced recent orders
    const enhancedRecentOrders = recentOrders.map(order => {
      const sellingVendors = [...new Set(order.items.map(item => item.vendorName))];
      return {
        ...order,
        sellingVendors: sellingVendors.slice(0, 3),
        vendorCount: sellingVendors.length
      };
    });

    // Status distribution for chart
    const statusDistribution = statusBreakdown.map(item => ({
      status: item._id,
      count: item.count
    }));

    // Get total vendors count
    const totalVendors = await Vendor.countDocuments();

    // Format monthly trend data
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.revenue || 0,
      orders: item.orders || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          lifetime: {
            totalOrders: totalOrders || 0,
            totalRevenue: totalRevenue[0]?.total || 0,
            avgOrderValue: avgOrderValue[0]?.avg || 0
          },
          monthly: monthlyStats[0] || {
            orders: 0,
            revenue: 0
          },
          daily: dailyStats[0] || {
            orders: 0,
            revenue: 0
          },
          totalVendors: totalVendors || 0,
          activeVendors: uniqueVendors[0]?.count || 0
        },
        analytics: {
          monthlyTrend: formattedMonthlyTrend,
          statusDistribution,
          statusBreakdown
        },
        rankings: {
          topSellingVendors: topVendors,
          topBuyingVendors: topBuyers
        },
        recentActivity: {
          recentOrders: enhancedRecentOrders,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error in getAdminDashboardStats:', error);
    next(error);
  }
};

// @desc    Get all orders (sell and purchase) with filtering
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      type = '', // 'sell' or 'purchase'
      vendorId = '',
      dateFrom = '',
      dateTo = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    const query = {};
    
    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }
    
    // Status filtering
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Vendor-specific orders
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      if (type === 'sell') {
        query['items.vendor'] = new mongoose.Types.ObjectId(vendorId);
      } else if (type === 'purchase') {
        query.customer = new mongoose.Types.ObjectId(vendorId);
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { 'items.vendorName': { $regex: search, $options: 'i' } },
        { 'items.productName': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);
    
    // Transform orders to include type information
    const transformedOrders = orders.map(order => {
      let orderType = 'mixed';
      
      if (vendorId) {
        const isSelling = order.items.some(item => 
          item.vendor && item.vendor.toString() === vendorId.toString()
        );
        orderType = isSelling ? 'sell' : 'purchase';
      }
      
      // Get all unique vendors in this order
      const sellingVendors = [...new Set(order.items.map(item => ({
        id: item.vendor,
        name: item.vendorName
      })))];
      
      return {
        ...order,
        orderType,
        sellingVendors,
        itemCount: order.items.length,
        vendorCount: sellingVendors.length
      };
    });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: transformedOrders
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/admin/orders/recent
// @access  Private (Admin)
export const getRecentOrders = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
      .lean();
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error in getRecentOrders:', error);
    next(error);
  }
};

// @desc    Get order analytics
// @route   GET /api/admin/orders/analytics
// @access  Private (Admin)
export const getOrderAnalytics = async (req, res, next) => {
  try {
    const { groupBy = 'day', dateFrom, dateTo } = req.query;
    
    const matchStage = {};
    
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchStage.createdAt.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = toDate;
      }
    }
    
    let groupStage;
    
    switch (groupBy) {
      case 'hour':
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: { $hour: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        };
        break;
      case 'day':
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        };
        break;
      case 'week':
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              week: { $week: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        };
        break;
      case 'month':
      default:
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        };
    }
    
    const analytics = await Order.aggregate([
      { $match: matchStage },
      groupStage,
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);
    
    // Format dates for response
    const formattedAnalytics = analytics.map(item => {
      let dateLabel;
      const { _id } = item;
      
      if (groupBy === 'hour') {
        dateLabel = `${_id.year}-${_id.month.toString().padStart(2, '0')}-${_id.day.toString().padStart(2, '0')} ${_id.hour.toString().padStart(2, '0')}:00`;
      } else if (groupBy === 'day') {
        dateLabel = `${_id.year}-${_id.month.toString().padStart(2, '0')}-${_id.day.toString().padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        dateLabel = `${_id.year}-W${_id.week.toString().padStart(2, '0')}`;
      } else {
        dateLabel = `${_id.year}-${_id.month.toString().padStart(2, '0')}`;
      }
      
      return {
        date: dateLabel,
        orders: item.orders,
        revenue: item.revenue
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        groupBy,
        analytics: formattedAnalytics,
        summary: {
          totalOrders: formattedAnalytics.reduce((sum, item) => sum + item.orders, 0),
          totalRevenue: formattedAnalytics.reduce((sum, item) => sum + item.revenue, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error in getOrderAnalytics:', error);
    next(error);
  }
};

// @desc    Get top vendors
// @route   GET /api/admin/orders/top-vendors
// @access  Private (Admin)
export const getTopVendors = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const topVendors = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
      },
      {
        $group: {
          _id: '$items.vendor',
          vendorName: { $first: '$items.vendorName' },
          totalSales: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: topVendors
    });
  } catch (error) {
    console.error('Error in getTopVendors:', error);
    next(error);
  }
};

// @desc    Generate order invoice (PDF)
// @route   GET /api/admin/orders/:id/invoice
// @access  Private (Admin)
export const generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email pharmacyInfo.phone pharmacyInfo.taxId')
      .populate('items.product', 'productName ndcNumber strength dosageForm manufacturer');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    // Header
    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${order.orderNumber}`);
    doc.text(`Invoice Date: ${order.createdAt.toLocaleDateString()}`);
    doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
    doc.moveDown();
    
    // Bill To
    doc.fontSize(14).text('Bill To:', { underline: true });
    doc.fontSize(12);
    doc.text(order.customerName);
    if (order.customer?.pharmacyInfo?.legalBusinessName) {
      doc.text(order.customer.pharmacyInfo.legalBusinessName);
    }
    doc.text(order.customerEmail);
    if (order.customer?.pharmacyInfo?.phone) {
      doc.text(`Phone: ${order.customer.pharmacyInfo.phone}`);
    }
    if (order.shippingAddress) {
      doc.moveDown();
      doc.fontSize(14).text('Shipping Address:', { underline: true });
      doc.fontSize(12);
      doc.text(order.shippingAddress.line1);
      if (order.shippingAddress.line2) doc.text(order.shippingAddress.line2);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`);
      doc.text(`Phone: ${order.shippingAddress.phone}`);
    }
    
    doc.moveDown(2);
    
    // Items table header
    const tableTop = doc.y;
    const itemX = 50;
    const descX = 150;
    const qtyX = 350;
    const priceX = 400;
    const totalX = 450;
    
    doc.fontSize(12);
    doc.text('Item', itemX, tableTop);
    doc.text('Description', descX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Unit Price', priceX, tableTop);
    doc.text('Total', totalX, tableTop);
    
    doc.moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();
    
    // Items
    let y = tableTop + 30;
    order.items.forEach((item, i) => {
      doc.text(`${i + 1}`, itemX, y);
      doc.text(item.productName, descX, y, { width: 180 });
      doc.text(item.quantity.toString(), qtyX, y);
      doc.text(`$${item.unitPrice.toFixed(2)}`, priceX, y);
      doc.text(`$${item.totalPrice.toFixed(2)}`, totalX, y);
      y += 25;
    });
    
    // Totals
    y += 10;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 20;
    
    doc.text('Subtotal:', 350, y);
    doc.text(`$${order.subtotal.toFixed(2)}`, totalX, y);
    y += 20;
    
    if (order.shippingCost > 0) {
      doc.text('Shipping:', 350, y);
      doc.text(`$${order.shippingCost.toFixed(2)}`, totalX, y);
      y += 20;
    }
    
    if (order.tax > 0) {
      doc.text('Tax:', 350, y);
      doc.text(`$${order.tax.toFixed(2)}`, totalX, y);
      y += 20;
    }
    
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Total:', 350, y);
    doc.text(`$${order.total.toFixed(2)}`, totalX, y);
    
    doc.moveDown(3);
    doc.fontSize(12).font('Helvetica');
    
    // Payment information
    doc.text('Payment Information:', { underline: true });
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase().replace('_', ' ')}`);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
    doc.text(`Order Status: ${order.status.toUpperCase().replace('_', ' ')}`);
    
    // Vendor orders section
    if (order.vendorOrders && order.vendorOrders.length > 0) {
      doc.moveDown();
      doc.text('Vendor Orders:', { underline: true });
      order.vendorOrders.forEach((vendorOrder, index) => {
        doc.text(`${index + 1}. ${vendorOrder.vendorName} - Status: ${vendorOrder.status}`);
        if (vendorOrder.trackingNumber) {
          doc.text(`   Tracking: ${vendorOrder.trackingNumber} (${vendorOrder.carrier || 'N/A'})`);
        }
      });
    }
    
    // Footer
    doc.moveDown(3);
    doc.fontSize(10);
    doc.text('Thank you for your business!', { align: 'center' });
    doc.text('This is a computer-generated invoice. No signature required.', { align: 'center' });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export orders to Excel
// @route   GET /api/admin/orders/export
// @access  Private (Admin)
export const exportOrdersToExcel = async (req, res, next) => {
  try {
    const { type = 'all', dateFrom, dateTo } = req.query;
    
    const query = {};
    
    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    let orders;
    
    if (type === 'sell') {
      // Get all orders with item vendor details
      orders = await Order.find(query)
        .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
        .lean();
    } else if (type === 'purchase') {
      orders = await Order.find(query)
        .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
        .lean();
    } else {
      orders = await Order.find(query)
        .populate('customer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
        .lean();
    }
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    
    // Define columns
    worksheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 15 },
      { header: 'Order Date', key: 'createdAt', width: 15 },
      { header: 'Customer', key: 'customerName', width: 25 },
      { header: 'Customer Email', key: 'customerEmail', width: 25 },
      { header: 'Total Items', key: 'itemCount', width: 12 },
      { header: 'Vendors', key: 'vendorCount', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Tax', key: 'tax', width: 12 },
      { header: 'Shipping', key: 'shippingCost', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 }
    ];
    
    // Add data rows
    orders.forEach(order => {
      const vendorCount = [...new Set(order.items.map(item => item.vendorName))].length;
      
      worksheet.addRow({
        orderNumber: order.orderNumber,
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        itemCount: order.items.length,
        vendorCount: vendorCount,
        subtotal: `$${order.subtotal.toFixed(2)}`,
        tax: `$${order.tax.toFixed(2)}`,
        shippingCost: `$${order.shippingCost.toFixed(2)}`,
        total: `$${order.total.toFixed(2)}`,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      });
    });
    
    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Auto-filter
    worksheet.autoFilter = 'A1:M1';
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-export.xlsx');
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Update order status
    order.status = status;
    
    // Add to status history
    order.addStatusHistory(
      status,
      req.user._id,
      'admin',
      note || `Status updated by admin`
    );
    
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

// @desc    Update vendor order status (admin)
// @route   PUT /api/admin/orders/:orderId/vendor/:vendorId/status
// @access  Private (Admin)
export const updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier, note } = req.body;
    const { orderId, vendorId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update vendor order status
    order.updateVendorOrderStatus(
      vendorId,
      status,
      trackingNumber,
      carrier,
      note
    );
    
    // Add to status history
    order.addStatusHistory(
      status,
      req.user._id,
      'admin',
      `Vendor order status updated for vendor ${vendorId}: ${note || ''}`
    );
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Vendor order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

