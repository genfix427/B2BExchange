// models/Offer.model.js
import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  // Product being offered on
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productNDC: {
    type: String
  },
  productImage: {
    url: String,
    publicId: String
  },
  originalPrice: {
    type: Number,
    required: true
  },

  // Buyer vendor (the one making the offer)
  buyerVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  buyerVendorName: {
    type: String,
    required: true
  },

  // Seller vendor (the one who owns the product)
  sellerVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  sellerVendorName: {
    type: String,
    required: true
  },

  // Offer details
  offerPrice: {
    type: Number,
    required: true,
    min: 0.01
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },

  // Counter offer details
  counterPrice: {
    type: Number,
    default: null
  },
  counterMessage: {
    type: String,
    maxlength: 500,
    default: ''
  },
  counteredAt: {
    type: Date,
    default: null
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'counter_accepted', 'counter_rejected', 'expired', 'cancelled'],
    default: 'pending'
  },

  // Rejection reason
  rejectionReason: {
    type: String,
    default: ''
  },

  // Converted order reference
  convertedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  offerReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    default: null
  },
  isFromOffer: {
    type: Boolean,
    default: false
  },

  // Timestamps for status changes
  acceptedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },

  // Expiration (offers expire after 7 days)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  },

  // Product snapshot at time of offer
  productSnapshot: {
    strength: String,
    dosageForm: String,
    manufacturer: String,
    packSize: String,
    lotNumber: String,
    expirationDate: Date,
    packageCondition: String
  }
}, {
  timestamps: true
});

// Indexes for performance
offerSchema.index({ buyerVendor: 1, status: 1, createdAt: -1 });
offerSchema.index({ sellerVendor: 1, status: 1, createdAt: -1 });
offerSchema.index({ product: 1 });
offerSchema.index({ expiresAt: 1 });
offerSchema.index({ status: 1 });

// Virtual for total offer value
offerSchema.virtual('totalOfferValue').get(function() {
  return this.offerPrice * this.quantity;
});

// Virtual for total counter value
offerSchema.virtual('totalCounterValue').get(function() {
  if (!this.counterPrice) return null;
  return this.counterPrice * this.quantity;
});

// Check if offer is expired
offerSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Auto-expire check
offerSchema.pre('find', function() {
  // This middleware doesn't auto-update, we'll handle expiration in controller
});

offerSchema.set('toJSON', { virtuals: true });
offerSchema.set('toObject', { virtuals: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;