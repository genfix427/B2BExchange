import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Vendor actions
      'vendor_approved',
      'vendor_rejected',
      'vendor_suspended',
      'vendor_reactivated',
      'vendor_deleted',
      // Product actions
      'product_updated',
      'product_deleted',
      // Order actions
      'order_status_updated',
      'vendor_order_status_updated',
      // Admin actions
      'admin_profile_updated',
      // Generic
      'other'
    ],
    index: true
  },
  actionCategory: {
    type: String,
    required: true,
    enum: ['vendor', 'product', 'order', 'admin', 'other'],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  target: {
    type: {
      type: String,
      enum: ['vendor', 'product', 'order', 'admin']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String
  },
  // Extra details about the action
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String
}, {
  timestamps: true
});

// Compound indexes for efficient queries
adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ admin: 1, createdAt: -1 });
adminActivitySchema.index({ action: 1, createdAt: -1 });
adminActivitySchema.index({ actionCategory: 1, createdAt: -1 });

const AdminActivity = mongoose.model('AdminActivity', adminActivitySchema);

export default AdminActivity;