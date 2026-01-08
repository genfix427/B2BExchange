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

    // Check vendor status and return appropriate response
    if (vendor.status !== 'approved') {
      let message = '';
      let redirectTo = '';
      
      switch (vendor.status) {
        case 'pending':
          message = 'Account pending admin approval';
          redirectTo = '/pending-approval';
          break;
        case 'rejected':
          message = 'Account has been rejected';
          redirectTo = '/account-rejected';
          break;
        case 'suspended':
          message = 'Account has been suspended';
          redirectTo = '/account-suspended';
          break;
        default:
          message = 'Account not approved';
          redirectTo = '/pending-approval';
      }

      return res.status(403).json({
        success: false,
        message,
        data: {
          status: vendor.status,
          redirectTo,
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
        profileCompleted: vendor.profileCompleted,
        pharmacyInfo: vendor.pharmacyInfo,
        pharmacyOwner: vendor.pharmacyOwner
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
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
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
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
    console.error('Admin login error:', error);
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    let userData;
    
    if (req.user.role === 'vendor') {
      // Populate vendor data
      const vendor = await Vendor.findById(req.user._id)
        .select('-password')
        .populate('approvedBy', 'firstName lastName email');
      
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      userData = {
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
        rejectionReason: vendor.rejectionReason
      };
    } else {
      // Admin data
      userData = {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        isActive: req.user.isActive,
        permissions: req.user.permissions,
        lastLoginAt: req.user.lastLoginAt
      };
    }

    res.status(200).json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get current user error:', error);
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
    console.error('Logout error:', error);
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
    console.error('Forgot password error:', error);
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
    console.error('Reset password error:', error);
    next(error);
  }
};