import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Vendor', 'Admin']
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000) // 1 hour
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries and TTL for automatic cleanup
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ token: 1, type: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;