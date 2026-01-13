import Vendor from '../../models/Vendor.model.js';
import Order from '../../models/Order.model.js';
import Product from '../../models/Product.model.js';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Helper function to calculate date range
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      startDate = subDays(now, 7);
      endDate = now;
      break;
    case 'month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'quarter':
      startDate = subDays(now, 90);
      endDate = now;
      break;
    case 'year':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    default:
      startDate = subDays(now, 30);
      endDate = now;
  }
  
  return { startDate, endDate };
};

// @desc    Get vendor analytics overview
// @route   GET /api/admin/analytics/vendors/overview
// @access  Private (Admin)
export const getVendorAnalyticsOverview = async (req, res, next) => {
  try {
    const { period = 'month', dateFrom, dateTo } = req.query;
    
    // Determine date range
    let startDate, endDate;
    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo + 'T23:59:59.999Z');
    } else {
      const range = getDateRange(period);
      startDate = range.startDate;
      endDate = range.endDate;
    }
    
    // Total vendor statistics
    const totalStats = await Vendor.aggregate([
      {
        $facet: {
          total: [
            { $count: 'totalVendors' }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          registrationTrend: [
            {
              $match: {
                registeredAt: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$registeredAt' },
                  month: { $month: '$registeredAt' },
                  day: { $dayOfMonth: '$registeredAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ]
        }
      }
    ]);
    
    // Order statistics for vendors
    const orderStats = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$items.vendor',
          vendorName: { $first: '$items.vendorName' },
          totalSales: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$items.quantity' },
          avgOrderValue: { $avg: '$items.totalPrice' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalSales' },
          avgRevenuePerVendor: { $avg: '$totalSales' },
          avgOrdersPerVendor: { $avg: '$totalOrders' },
          topVendor: { $max: { vendorName: '$vendorName', sales: '$totalSales' } }
        }
      }
    ]);
    
    // Active vendor metrics
    const activeVendors = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$items.vendor'
        }
      },
      {
        $count: 'activeVendors'
      }
    ]);
    
    // Product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: '$vendor',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$quantityInStock' },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $group: {
          _id: null,
          avgProductsPerVendor: { $avg: '$productCount' },
          avgStockPerVendor: { $avg: '$totalStock' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate,
          label: period
        },
        summary: {
          totalVendors: totalStats[0]?.total[0]?.totalVendors || 0,
          activeVendors: activeVendors[0]?.activeVendors || 0,
          totalRevenue: orderStats[0]?.totalRevenue || 0,
          avgRevenuePerVendor: orderStats[0]?.avgRevenuePerVendor || 0,
          avgOrdersPerVendor: orderStats[0]?.avgOrdersPerVendor || 0,
          avgProductsPerVendor: productStats[0]?.avgProductsPerVendor || 0,
          avgStockPerVendor: productStats[0]?.avgStockPerVendor || 0
        },
        statusDistribution: totalStats[0]?.statusBreakdown || [],
        topVendor: orderStats[0]?.topVendor || null,
        registrationTrend: totalStats[0]?.registrationTrend || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor performance metrics
// @route   GET /api/admin/analytics/vendors/performance
// @access  Private (Admin)
export const getVendorPerformanceMetrics = async (req, res, next) => {
  try {
    const { limit = 10, sortBy = 'totalSales', sortOrder = 'desc', dateFrom, dateTo } = req.query;
    
    const matchStage = {};
    
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchStage.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    } else {
      // Default to last 30 days
      matchStage.createdAt = { $gte: subDays(new Date(), 30) };
    }
    
    const performanceMetrics = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: matchStage
      },
      {
        $group: {
          _id: '$items.vendor',
          vendorName: { $first: '$items.vendorName' },
          totalSales: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$items.quantity' },
          avgOrderValue: { $avg: '$items.totalPrice' },
          avgDeliveryTime: { $avg: { $subtract: ['$deliveredAt', '$createdAt'] } },
          lastActivity: { $max: '$createdAt' },
          // Calculate performance score (0-100)
          performanceScore: {
            $avg: {
              $multiply: [
                {
                  $cond: [
                    { $gt: ['$items.totalPrice', 0] },
                    { $divide: ['$items.totalPrice', 10000] },
                    0
                  ]
                },
                100
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorDetails'
        }
      },
      {
        $unwind: {
          path: '$vendorDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          vendorStatus: '$vendorDetails.status',
          registrationDate: '$vendorDetails.registeredAt'
        }
      },
      {
        $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: performanceMetrics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor growth trends
// @route   GET /api/admin/analytics/vendors/growth
// @access  Private (Admin)
export const getVendorGrowthTrends = async (req, res, next) => {
  try {
    const { groupBy = 'month', dateFrom, dateTo } = req.query;
    
    const matchStage = {};
    
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchStage.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    } else {
      // Default to last 12 months
      matchStage.createdAt = { $gte: subDays(new Date(), 365) };
    }
    
    let groupStage;
    
    switch (groupBy) {
      case 'day':
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
            uniqueVendors: { $addToSet: '$items.vendor' }
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
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
            uniqueVendors: { $addToSet: '$items.vendor' }
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
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
            uniqueVendors: { $addToSet: '$items.vendor' }
          }
        };
    }
    
    const growthTrends = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      groupStage,
      {
        $project: {
          period: '$_id',
          revenue: 1,
          orders: 1,
          vendorCount: { $size: '$uniqueVendors' },
          _id: 0
        }
      },
      { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.week': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: growthTrends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor status distribution
// @route   GET /api/admin/analytics/vendors/status-distribution
// @access  Private (Admin)
export const getVendorStatusDistribution = async (req, res, next) => {
  try {
    const statusDistribution = await Vendor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProducts: { $avg: { $size: { $ifNull: ['$products', []] } } },
          avgRevenue: { $avg: { $ifNull: ['$totalRevenue', 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: statusDistribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top performing vendors
// @route   GET /api/admin/analytics/vendors/top-performing
// @access  Private (Admin)
export const getTopPerformingVendors = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const topVendors = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $match: {
          createdAt: { $gte: subDays(new Date(), 30) }
        }
      },
      {
        $group: {
          _id: '$items.vendor',
          vendorName: { $first: '$items.vendorName' },
          totalSales: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$items.quantity' },
          avgOrderValue: { $avg: '$items.totalPrice' },
          // Calculate metrics for performance score
          onTimeDeliveryRate: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$deliveredAt', null] }, { $lte: ['$deliveredAt', '$estimatedDelivery'] }] },
                1,
                0
              ]
            }
          },
          avgResponseTime: {
            $avg: {
              $cond: [
                { $ne: ['$firstResponseAt', null] },
                { $subtract: ['$firstResponseAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorDetails'
        }
      },
      {
        $unwind: '$vendorDetails'
      },
      {
        $addFields: {
          // Calculate performance score (0-100)
          performanceScore: {
            $add: [
              { $multiply: [{ $divide: ['$totalSales', 10000] }, 40] }, // Sales weight: 40%
              { $multiply: ['$onTimeDeliveryRate', 30] }, // Delivery weight: 30%
              {
                $cond: [
                  { $lt: [{ $divide: ['$avgResponseTime', 3600000] }, 24] },
                  30, // Response within 24 hours: 30%
                  15  // Response > 24 hours: 15%
                ]
              }
            ]
          },
          vendorStatus: '$vendorDetails.status',
          registrationDate: '$vendorDetails.registeredAt',
          productCount: { $size: { $ifNull: ['$vendorDetails.products', []] } }
        }
      },
      {
        $sort: { performanceScore: -1 }
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
    next(error);
  }
};

// @desc    Get vendor registration trends
// @route   GET /api/admin/analytics/vendors/registrations
// @access  Private (Admin)
export const getVendorRegistrationTrends = async (req, res, next) => {
  try {
    const { groupBy = 'month', dateFrom, dateTo } = req.query;
    
    const matchStage = {};
    
    if (dateFrom || dateTo) {
      matchStage.registeredAt = {};
      if (dateFrom) matchStage.registeredAt.$gte = new Date(dateFrom);
      if (dateTo) matchStage.registeredAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    } else {
      // Default to last 12 months
      matchStage.registeredAt = { $gte: subDays(new Date(), 365) };
    }
    
    let groupStage;
    
    switch (groupBy) {
      case 'day':
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$registeredAt' },
              month: { $month: '$registeredAt' },
              day: { $dayOfMonth: '$registeredAt' }
            },
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        };
        break;
      case 'week':
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$registeredAt' },
              week: { $week: '$registeredAt' }
            },
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        };
        break;
      case 'month':
      default:
        groupStage = {
          $group: {
            _id: {
              year: { $year: '$registeredAt' },
              month: { $month: '$registeredAt' }
            },
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        };
    }
    
    const registrationTrends = await Vendor.aggregate([
      { $match: matchStage },
      groupStage,
      {
        $project: {
          period: '$_id',
          totalRegistrations: '$count',
          activeRegistrations: '$activeCount',
          activationRate: {
            $cond: [
              { $gt: ['$count', 0] },
              { $multiply: [{ $divide: ['$activeCount', '$count'] }, 100] },
              0
            ]
          },
          _id: 0
        }
      },
      { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.week': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: registrationTrends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export vendor analytics
// @route   GET /api/admin/analytics/vendors/export
// @access  Private (Admin)
export const exportVendorAnalytics = async (req, res, next) => {
  try {
    const { format = 'excel', dateFrom, dateTo, period } = req.query;
    
    // Get vendor analytics data
    const overview = await Vendor.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'vendor',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { vendorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$vendorId', '$items.vendor']
                }
              }
            },
            {
              $unwind: '$items'
            },
            {
              $match: {
                $expr: {
                  $eq: ['$items.vendor', '$$vendorId']
                }
              }
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: '$items.totalPrice' },
                totalOrders: { $sum: 1 },
                totalItems: { $sum: '$items.quantity' }
              }
            }
          ],
          as: 'salesData'
        }
      },
      {
        $project: {
          vendorName: '$pharmacyInfo.legalBusinessName',
          email: '$email',
          status: 1,
          registeredAt: 1,
          productCount: { $size: '$products' },
          totalStock: { $sum: '$products.quantityInStock' },
          totalSales: { $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] },
          totalOrders: { $ifNull: [{ $arrayElemAt: ['$salesData.totalOrders', 0] }, 0] },
          totalItems: { $ifNull: [{ $arrayElemAt: ['$salesData.totalItems', 0] }, 0] },
          avgOrderValue: {
            $cond: [
              { $gt: [{ $ifNull: [{ $arrayElemAt: ['$salesData.totalOrders', 0] }, 0] }, 0] },
              { $divide: [
                { $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$salesData.totalOrders', 0] }, 0] }
              ]},
              0
            ]
          }
        }
      }
    ]);
    
    if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Vendor Analytics');
      
      // Define columns
      worksheet.columns = [
        { header: 'Vendor Name', key: 'vendorName', width: 30 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registered Date', key: 'registeredAt', width: 15 },
        { header: 'Products', key: 'productCount', width: 10 },
        { header: 'Total Stock', key: 'totalStock', width: 12 },
        { header: 'Total Sales', key: 'totalSales', width: 15 },
        { header: 'Total Orders', key: 'totalOrders', width: 12 },
        { header: 'Total Items', key: 'totalItems', width: 12 },
        { header: 'Avg Order Value', key: 'avgOrderValue', width: 15 }
      ];
      
      // Add data rows
      overview.forEach(vendor => {
        worksheet.addRow({
          vendorName: vendor.vendorName,
          email: vendor.email,
          status: vendor.status,
          registeredAt: new Date(vendor.registeredAt).toLocaleDateString(),
          productCount: vendor.productCount,
          totalStock: vendor.totalStock,
          totalSales: `$${vendor.totalSales.toFixed(2)}`,
          totalOrders: vendor.totalOrders,
          totalItems: vendor.totalItems,
          avgOrderValue: `$${vendor.avgOrderValue.toFixed(2)}`
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
      worksheet.autoFilter = 'A1:J1';
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=vendor-analytics.xlsx');
      
      // Write workbook to response
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'csv') {
      // Create CSV content
      const headers = ['Vendor Name,Email,Status,Registered Date,Products,Total Stock,Total Sales,Total Orders,Total Items,Avg Order Value'];
      const rows = overview.map(vendor => 
        `"${vendor.vendorName}","${vendor.email}","${vendor.status}","${new Date(vendor.registeredAt).toLocaleDateString()}",${vendor.productCount},${vendor.totalStock},$${vendor.totalSales.toFixed(2)},${vendor.totalOrders},${vendor.totalItems},$${vendor.avgOrderValue.toFixed(2)}`
      );
      
      const csvContent = [...headers, ...rows].join('\n');
      
      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vendor-analytics.csv');
      
      res.send(csvContent);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    next(error);
  }
};