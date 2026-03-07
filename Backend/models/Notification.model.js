// models/Notification.model.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  type: {
    type: String,
    enum: [
      'offer_received',
      'offer_accepted',
      'offer_rejected',
      'offer_countered',
      'counter_accepted',
      'counter_rejected',
      'offer_expired',
      'order_created',
      'order_shipped',
      'order_delivered',
      'new_order'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Reference to related entity
  relatedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    default: null
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  // Sender info
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  senderName: {
    type: String,
    default: ''
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;