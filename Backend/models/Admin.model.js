import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  permissions: {
    canApproveVendors: {
      type: Boolean,
      default: true
    },
    canManageVendors: {  // CHANGE FROM canManageAdmins TO canManageVendors
      type: Boolean,
      default: true  // Set to true by default
    },
    canViewAnalytics: {
      type: Boolean,
      default: true
    },
    canManageSettings: {
      type: Boolean,
      default: false
    },
    canSuspendVendors: {
      type: Boolean,
      default: true
    },
    canManageAdmins: {  // Add this for admin management
      type: Boolean,
      default: false
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  profileImage: String,
  notes: String
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return "";
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;