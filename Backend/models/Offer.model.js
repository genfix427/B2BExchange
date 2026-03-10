// backend/models/Offer.model.js
import mongoose from 'mongoose';

const offerHistorySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['created', 'countered', 'accepted', 'rejected', 'expired', 'cancelled'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  performedByRole: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },
  price: Number,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const offerSchema = new mongoose.Schema({
  // Buyer (the vendor making the offer)
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },

  // Seller (the vendor who owns the product)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },

  // Product being offered on
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Snapshot of product info at time of offer
  productName: {
    type: String,
    required: true
  },
  ndcNumber: {
    type: String
  },
  manufacturer: {
    type: String
  },
  productSnapshot: {
    dosageForm: String,
    strength: String,
    packSize: String,
    lotNumber: String,
    expirationDate: Date,
    manufacturer: String,
    image: {
      url: String,
      publicId: String
    }
  },

  // Quantity requested
  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  // Original listing price per unit
  originalPrice: {
    type: Number,
    required: true,
    min: 0.01
  },

  // Buyer's offered price per unit
  offeredPrice: {
    type: Number,
    required: true,
    min: 0.01
  },

  // Seller's counter price per unit
  counterPrice: {
    type: Number,
    min: 0.01
  },

  // Final agreed price per unit (set on acceptance)
  finalPrice: {
    type: Number,
    min: 0.01
  },

  // Offer status
  status: {
    type: String,
    enum: ['pending', 'countered', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'pending'
  },

  // Messages
  message: {
    type: String,
    maxlength: 500
  },
  counterMessage: {
    type: String,
    maxlength: 500
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },

  // Tracking
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  acceptedAt: Date,

  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  rejectedAt: Date,

  counteredAt: Date,

  // Link to resulting order
  resultingOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  // History of all actions
  history: [offerHistorySchema],

  // Expiry (default 7 days)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

// Indexes
offerSchema.index({ buyer: 1, status: 1 });
offerSchema.index({ seller: 1, status: 1 });
offerSchema.index({ product: 1 });
offerSchema.index({ status: 1, createdAt: -1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;