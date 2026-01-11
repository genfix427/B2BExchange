// services/stockMonitoring.service.js
import Product from '../models/Product.model.js';
import Vendor from '../models/Vendor.model.js';

class StockMonitoringService {
  constructor() {
    this.lowStockThreshold = 10;
  }

  // Check and update product statuses
  async checkAndUpdateProductStatuses() {
    try {
      console.log('🔍 Checking product stock statuses...');
      
      // Find products that should be out of stock
      const outOfStockProducts = await Product.find({
        quantityInStock: { $lte: 0 },
        status: { $nin: ['out_of_stock', 'inactive'] }
      });
      
      // Find products that should be reactivated
      const restockedProducts = await Product.find({
        quantityInStock: { $gt: 0 },
        status: 'out_of_stock'
      });
      
      // Batch update out of stock products
      if (outOfStockProducts.length > 0) {
        const outOfStockIds = outOfStockProducts.map(p => p._id);
        await Product.updateMany(
          { _id: { $in: outOfStockIds } },
          { $set: { status: 'out_of_stock', updatedAt: new Date() } }
        );
        console.log(`✅ Updated ${outOfStockProducts.length} products to 'out_of_stock'`);
      }
      
      // Batch update restocked products
      if (restockedProducts.length > 0) {
        const restockedIds = restockedProducts.map(p => p._id);
        await Product.updateMany(
          { _id: { $in: restockedIds } },
          { $set: { status: 'active', updatedAt: new Date() } }
        );
        console.log(`✅ Reactivated ${restockedProducts.length} products`);
      }
      
      return {
        outOfStockUpdated: outOfStockProducts.length,
        reactivated: restockedProducts.length
      };
    } catch (error) {
      console.error('Error in stock monitoring:', error);
      throw error;
    }
  }

  // Get vendor stock statistics
  async getVendorStockStats(vendorId) {
    try {
      const stats = await Product.aggregate([
        {
          $match: { vendor: vendorId }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$status', 'active'] },
                    { $gt: ['$quantityInStock', 0] }
                  ]},
                  1,
                  0
                ]
              }
            },
            outOfStockProducts: {
              $sum: {
                $cond: [
                  { $or: [
                    { $eq: ['$status', 'out_of_stock'] },
                    { $lte: ['$quantityInStock', 0] }
                  ]},
                  1,
                  0
                ]
              }
            },
            totalStock: {
              $sum: {
                $cond: [
                  { $gt: ['$quantityInStock', 0] },
                  '$quantityInStock',
                  0
                ]
              }
            },
            totalValue: {
              $sum: {
                $cond: [
                  { $gt: ['$quantityInStock', 0] },
                  { $multiply: ['$quantityInStock', '$price'] },
                  0
                ]
              }
            },
            avgPrice: { $avg: '$price' }
          }
        }
      ]);
      
      return stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        totalStock: 0,
        totalValue: 0,
        avgPrice: 0
      };
    } catch (error) {
      console.error('Error getting vendor stock stats:', error);
      throw error;
    }
  }

  // Get platform-wide stock statistics
  async getPlatformStockStats() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$status', 'active'] },
                    { $gt: ['$quantityInStock', 0] }
                  ]},
                  1,
                  0
                ]
              }
            },
            outOfStockProducts: {
              $sum: {
                $cond: [
                  { $or: [
                    { $eq: ['$status', 'out_of_stock'] },
                    { $lte: ['$quantityInStock', 0] }
                  ]},
                  1,
                  0
                ]
              }
            },
            totalVendors: { $addToSet: '$vendor' },
            totalStock: {
              $sum: {
                $cond: [
                  { $gt: ['$quantityInStock', 0] },
                  '$quantityInStock',
                  0
                ]
              }
            },
            totalValue: {
              $sum: {
                $cond: [
                  { $gt: ['$quantityInStock', 0] },
                  { $multiply: ['$quantityInStock', '$price'] },
                  0
                ]
              }
            },
            avgPrice: { $avg: '$price' }
          }
        },
        {
          $project: {
            totalProducts: 1,
            activeProducts: 1,
            outOfStockProducts: 1,
            totalVendors: { $size: '$totalVendors' },
            totalStock: 1,
            totalValue: 1,
            avgPrice: { $round: ['$avgPrice', 2] }
          }
        }
      ]);
      
      return stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        totalVendors: 0,
        totalStock: 0,
        totalValue: 0,
        avgPrice: 0
      };
    } catch (error) {
      console.error('Error getting platform stock stats:', error);
      throw error;
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(vendorId = null) {
    try {
      const query = {
        quantityInStock: { $gt: 0, $lt: this.lowStockThreshold },
        status: 'active'
      };
      
      if (vendorId) {
        query.vendor = vendorId;
      }
      
      const lowStockProducts = await Product.find(query)
        .populate('vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba')
        .sort({ quantityInStock: 1 })
        .limit(20);
      
      return lowStockProducts.map(product => ({
        _id: product._id,
        productName: product.productName,
        ndcNumber: product.ndcNumber,
        currentStock: product.quantityInStock,
        price: product.price,
        status: product.quantityInStock <= 3 ? 'CRITICAL' : 'LOW',
        vendorName: product.vendorName || product.vendor?.pharmacyInfo?.legalBusinessName,
        vendorId: product.vendor?._id,
        lastUpdated: product.updatedAt
      }));
    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      throw error;
    }
  }
}

export default new StockMonitoringService();