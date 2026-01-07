import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';
import Token from '../models/Token.model.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/helpers.js';
import { sendPasswordResetEmail } from '../services/email.service.js';
import crypto from 'crypto';

// @desc    Vendor login
// @route   POST /api/auth/vendor/login
// @access  Public
export const vendorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find vendor with password selected
    const vendor = await Vendor.findOne({ email }).select('+password');
    
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if vendor is approved
    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account pending admin approval',
        data: { status: vendor.status }
      });
    }

    // Check password
    const isPasswordValid = await vendor.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    vendor.lastLoginAt = new Date();
    await vendor.save();

    // Generate token
    const token = generateToken(vendor._id, 'vendor');

    // Set cookie
    setTokenCookie(res, token);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: vendor._id,
        email: vendor.email,
        role: 'vendor',
        status: vendor.status,
        profileCompleted: vendor.profileCompleted
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find admin with password selected
    const admin = await Admin.findOne({ email, isActive: true }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, admin.role);

    // Set cookie
    setTokenCookie(res, token);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, userType = 'Vendor' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find user based on type
    let user;
    if (userType === 'Vendor') {
      user = await Vendor.findOne({ email, status: 'approved' });
    } else {
      user = await Admin.findOne({ email, isActive: true });
    }

    if (!user) {
      // Still return success for security (don't reveal if email exists)
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link will be sent'
      });
    }

    // Delete any existing reset tokens
    await Token.deleteMany({
      userId: user._id,
      userType,
      type: 'password_reset'
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to database
    await Token.create({
      userId: user._id,
      userType,
      token: hashedToken,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link will be sent'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, userType = 'Vendor' } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const passwordResetToken = await Token.findOne({
      token: hashedToken,
      userType,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
      used: false
    });

    if (!passwordResetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find user
    let user;
    if (userType === 'Vendor') {
      user = await Vendor.findById(passwordResetToken.userId);
    } else {
      user = await Admin.findById(passwordResetToken.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Mark token as used
    passwordResetToken.used = true;
    await passwordResetToken.save();

    // Delete all reset tokens for this user
    await Token.deleteMany({
      userId: user._id,
      userType,
      type: 'password_reset'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    let user;
    
    if (req.user.role === 'vendor') {
      user = await Vendor.findById(req.user.id)
        .select('-password')
        .populate('approvedBy', 'firstName lastName');
    } else {
      user = await Admin.findById(req.user.id)
        .select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        role: req.user.role
      }
    });

  } catch (error) {
    next(error);
  }
};