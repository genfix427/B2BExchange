import Vendor from '../models/Vendor.model.js';
import Token from '../models/Token.model.js';
import { generateToken, setVendorTokenCookie, clearVendorTokenCookie } from '../utils/vendorHelpers.js';
import { sendPasswordResetEmail } from '../services/email.service.js';
import crypto from 'crypto';

// @desc    Vendor login
// @route   POST /api/vendor/auth/login
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
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await vendor.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check vendor status
    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Account is ${vendor.status}`,
        data: { 
          status: vendor.status,
          id: vendor._id,
          email: vendor.email,
          rejectionReason: vendor.rejectionReason,
          suspensionReason: vendor.suspensionReason
        }
      });
    }

    // Update last login
    vendor.lastLoginAt = new Date();
    await vendor.save();

    // Generate vendor token
    const token = generateToken(vendor._id, 'vendor');

    // Set vendor-specific cookie
    setVendorTokenCookie(res, token);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Vendor login successful',
      data: {
        id: vendor._id,
        email: vendor.email,
        role: 'vendor',
        status: vendor.status,
        profileCompleted: vendor.profileCompleted,
        pharmacyInfo: vendor.pharmacyInfo,
        pharmacyOwner: vendor.pharmacyOwner,
        lastLoginAt: vendor.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    next(error);
  }
};

// @desc    Vendor logout
// @route   POST /api/vendor/auth/logout
// @access  Private (Vendor)
export const vendorLogout = async (req, res, next) => {
  try {
    clearVendorTokenCookie(res);
    
    res.status(200).json({
      success: true,
      message: 'Vendor logged out successfully'
    });
  } catch (error) {
    console.error('Vendor logout error:', error);
    next(error);
  }
};

// @desc    Get current vendor
// @route   GET /api/vendor/auth/me
// @access  Private (Vendor)
export const getCurrentVendor = async (req, res, next) => {
  try {
    if (!req.vendor) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const vendor = await Vendor.findById(req.vendor._id)
      .select('-password')
      .populate('approvedBy', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const vendorData = {
      id: vendor._id,
      email: vendor.email,
      role: 'vendor',
      status: vendor.status,
      profileCompleted: vendor.profileCompleted || false,
      registeredAt: vendor.registeredAt,
      lastLoginAt: vendor.lastLoginAt,
      // Vendor specific data
      pharmacyInfo: vendor.pharmacyInfo,
      pharmacyOwner: vendor.pharmacyOwner,
      primaryContact: vendor.primaryContact,
      pharmacyLicense: vendor.pharmacyLicense,
      pharmacyQuestions: vendor.pharmacyQuestions,
      referralInfo: vendor.referralInfo,
      documents: vendor.documents,
      approvedBy: vendor.approvedBy,
      approvedAt: vendor.approvedAt,
      rejectionReason: vendor.rejectionReason,
      suspensionReason: vendor.suspensionReason,
      suspendedAt: vendor.suspendedAt
    };

    res.status(200).json({
      success: true,
      data: vendorData
    });

  } catch (error) {
    console.error('Get current vendor error:', error);
    next(error);
  }
};

// @desc    Vendor forgot password
// @route   POST /api/vendor/auth/forgot-password
// @access  Public
export const vendorForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const vendor = await Vendor.findOne({ email, status: 'approved' });

    if (!vendor) {
      // Still return success for security
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link will be sent'
      });
    }

    // Delete any existing reset tokens
    await Token.deleteMany({
      userId: vendor._id,
      userType: 'Vendor',
      type: 'password_reset'
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to database
    await Token.create({
      userId: vendor._id,
      userType: 'Vendor',
      token: hashedToken,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    // Send vendor-specific reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link will be sent'
    });

  } catch (error) {
    console.error('Vendor forgot password error:', error);
    next(error);
  }
};

// @desc    Vendor reset password
// @route   POST /api/vendor/auth/reset-password/:token
// @access  Public
export const vendorResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

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
      userType: 'Vendor',
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

    const vendor = await Vendor.findById(passwordResetToken.userId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update password
    vendor.password = password;
    await vendor.save();

    // Mark token as used
    passwordResetToken.used = true;
    await passwordResetToken.save();

    // Delete all reset tokens for this vendor
    await Token.deleteMany({
      userId: vendor._id,
      userType: 'Vendor',
      type: 'password_reset'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Vendor reset password error:', error);
    next(error);
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendor/auth/profile
// @access  Private (Vendor)
export const updateVendorProfile = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;
    const updateData = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    next(error);
  }
};