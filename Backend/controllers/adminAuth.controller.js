import Admin from '../models/Admin.model.js';
import Token from '../models/Token.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Helper functions
const generateAdminToken = (adminId, role) => {
  console.log('🔐 Generating token for admin:', { adminId, role });
  
  const payload = {
    id: adminId,  // Use 'id' not '_id' for consistency
    role: role,
    type: 'admin'  // Add type to distinguish from vendor tokens
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '8h' }
  );
  
  console.log('✅ Token generated:', {
    payload,
    expiresIn: process.env.JWT_EXPIRE || '8h'
  });
  
  return token;
};

const setAdminTokenCookie = (res, token) => {
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 8) * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  console.log('🍪 Setting admin_token cookie with options:', {
    expires: options.expires,
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });

  res.cookie('admin_token', token, options);
  console.log('✅ admin_token cookie set');
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find active admin with password
    const admin = await Admin.findOne({ email, isActive: true }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found or inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate admin-specific token
    const token = generateAdminToken(admin._id, admin.role);
    console.log('✅ Generated token for admin:', admin._id);

    // Clear any existing vendor tokens first
    res.clearCookie('vendor_token', { path: '/' });
    res.clearCookie('token', { path: '/' });

    // Set admin-specific cookie
    setAdminTokenCookie(res, token);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt
      }
    });

    console.log('✅ Admin login successful for:', email);

  } catch (error) {
    console.error('❌ Admin login error:', error);
    next(error);
  }
};

// Other admin auth controller functions remain the same...

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private (Admin)
export const adminLogout = async (req, res, next) => {
  try {
    console.log('Admin logout requested');
    
    clearAdminTokenCookie(res);
    
    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    next(error);
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
export const getCurrentAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const admin = await Admin.findById(req.admin._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    next(error);
  }
};

// @desc    Admin forgot password
// @route   POST /api/admin/auth/forgot-password
// @access  Public
export const adminForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const admin = await Admin.findOne({ email, isActive: true });

    if (!admin) {
      // Still return success for security
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link will be sent'
      });
    }

    // Delete any existing reset tokens
    await Token.deleteMany({
      userId: admin._id,
      userType: 'Admin',
      type: 'password_reset'
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to database
    await Token.create({
      userId: admin._id,
      userType: 'Admin',
      token: hashedToken,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });

    // Send admin-specific reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link will be sent'
    });

  } catch (error) {
    console.error('Admin forgot password error:', error);
    next(error);
  }
};

// @desc    Admin reset password
// @route   POST /api/admin/auth/reset-password/:token
// @access  Public
export const adminResetPassword = async (req, res, next) => {
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
      userType: 'Admin',
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

    const admin = await Admin.findById(passwordResetToken.userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update password
    admin.password = password;
    await admin.save();

    // Mark token as used
    passwordResetToken.used = true;
    await passwordResetToken.save();

    // Delete all reset tokens for this admin
    await Token.deleteMany({
      userId: admin._id,
      userType: 'Admin',
      type: 'password_reset'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Admin reset password error:', error);
    next(error);
  }
};