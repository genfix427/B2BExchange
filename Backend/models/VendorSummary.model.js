import mongoose from 'mongoose';

const vendorSummarySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true
  },
  vendorName: {
    type: String,
    required: true
  },
  // Sell stats
  totalSellOrders: {
    type: Number,
    default: 0
  },
  totalSellRevenue: {
    type: Number,
    default: 0
  },
  totalItemsSold: {
    type: Number,
    default: 0
  },
  sellStatusBreakdown: {
    pending: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    processing: { type: Number, default: 0 },
    shipped: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  // Purchase stats
  totalPurchaseOrders: {
    type: Number,
    default: 0
  },
  totalPurchaseAmount: {
    type: Number,
    default: 0
  },
  purchaseStatusBreakdown: {
    pending: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    processing: { type: Number, default: 0 },
    shipped: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  // Performance metrics
  avgOrderValue: {
    sell: { type: Number, default: 0 },
    purchase: { type: Number, default: 0 }
  },
  fulfillmentRate: {
    type: Number,
    default: 0
  },
  customerSatisfaction: {
    type: Number,
    default: 0
  },
  // Timestamps
  lastSellOrder: {
    type: Date
  },
  lastPurchaseOrder: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
vendorSummarySchema.index({ vendor: 1 });
vendorSummarySchema.index({ totalSellRevenue: -1 });
vendorSummarySchema.index({ totalPurchaseAmount: -1 });
vendorSummarySchema.index({ updatedAt: -1 });

// Update vendor summary when order is created/updated
vendorSummarySchema.statics.updateVendorSummary = async function(vendorId) {
  try {
    const Vendor = mongoose.model('Vendor');
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) return;
    
    // Calculate sell stats
    const sellStats = await mongoose.model('Order').aggregate([
      { $unwind: '$items' },
      { $match: { 'items.vendor': vendorId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$items.totalPrice' },
          items: { $sum: '$items.quantity' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);
    
    // Calculate purchase stats
    const purchaseStats = await mongoose.model('Order').aggregate([
      { $match: { customer: vendorId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$total' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);
    
    // Update vendor summary
    await this.findOneAndUpdate(
      { vendor: vendorId },
      {
        $set: {
          vendorName: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba,
          totalSellOrders: sellStats.reduce((sum, stat) => sum + stat.count, 0),
          totalSellRevenue: sellStats.reduce((sum, stat) => sum + stat.revenue, 0),
          totalItemsSold: sellStats.reduce((sum, stat) => sum + stat.items, 0),
          lastSellOrder: sellStats.length > 0 ? Math.max(...sellStats.map(s => s.lastOrder)) : null,
          totalPurchaseOrders: purchaseStats.reduce((sum, stat) => sum + stat.count, 0),
          totalPurchaseAmount: purchaseStats.reduce((sum, stat) => sum + stat.amount, 0),
          lastPurchaseOrder: purchaseStats.length > 0 ? Math.max(...purchaseStats.map(s => s.lastOrder)) : null,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating vendor summary:', error);
  }
};

const VendorSummary = mongoose.model('VendorSummary', vendorSummarySchema);
export default VendorSummary;