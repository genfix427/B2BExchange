import jwt from 'jsonwebtoken';
import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';

// ===================================
// ADMIN AUTHENTICATION MIDDLEWARE (Updated)
// ===================================
export const adminProtect = async (req, res, next) => {
  try {
    console.log('🔒 Admin protect middleware checking...');
    
    let token;

    // 1. Get admin token from cookie (primary method)
    if (req.cookies.admin_token) {
      token = req.cookies.admin_token;
      console.log('✅ Found admin_token in cookies');
    }
    // 2. Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Found token in Authorization header');
    }

    if (!token) {
      console.log('❌ No admin token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login as admin'
      });
    }

    console.log('🔐 Verifying admin token...');

    // 3. Verify admin token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ Token decoded:', { id: decoded.id, role: decoded.role });
    } catch (jwtError) {
      console.error('❌ JWT verification error:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Admin session expired, please login again'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }

    // 4. Check token structure
    if (!decoded.id || !decoded.role) {
      console.log('❌ Invalid token structure:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token format'
      });
    }

    // Check if token is for admin
    if (!['admin', 'super_admin', 'moderator'].includes(decoded.role)) {
      console.log('❌ Token not for admin:', decoded.role);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token - wrong role'
      });
    }

    // 5. Get admin from database
    console.log('🔍 Looking for admin with ID:', decoded.id);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.isActive) {
      console.log('❌ Admin is inactive');
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }

    // 6. Attach admin to request
    req.admin = admin;
    req.user = admin;
    req.userType = 'admin';
    req.user.role = decoded.role;

    console.log('✅ Admin authenticated:', admin.email);
    next();
  } catch (error) {
    console.error('💥 Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin authentication error'
    });
  }
};

// ===================================
// VENDOR AUTHENTICATION MIDDLEWARE
// ===================================
export const vendorProtect = async (req, res, next) => {
  try {
    let token;

    // 1. Get vendor token from cookie
    if (req.cookies.vendor_token) {
      token = req.cookies.vendor_token;
    }
    // 2. Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login as vendor'
      });
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Vendor session expired, please login again'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid vendor token'
      });
    }

    // 4. Check token is for vendor
    if (!decoded.id || decoded.role !== 'vendor') {
      return res.status(401).json({
        success: false,
        message: 'Invalid vendor token format'
      });
    }

    // 5. Get vendor from database
    const vendor = await Vendor.findById(decoded.id).select('-password');
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // 6. Check vendor status
    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Vendor account is ${vendor.status}`,
        data: { 
          status: vendor.status,
          rejectionReason: vendor.rejectionReason,
          suspensionReason: vendor.suspensionReason
        }
      });
    }

    // 7. Attach vendor to request
    req.vendor = vendor;
    req.user = vendor;
    req.userType = 'vendor';
    req.user.role = 'vendor';

    next();
  } catch (error) {
    console.error('Vendor auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Vendor authentication error'
    });
  }
};

// ===================================
// COMMON PROTECT MIDDLEWARE (Legacy - Not recommended)
// ===================================
export const protect = async (req, res, next) => {
  try {
    let token;
    let isAdminRoute = req.path.startsWith('/admin');

    // Determine which token to look for
    if (isAdminRoute && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    } else if (!isAdminRoute && req.cookies.vendor_token) {
      token = req.cookies.vendor_token;
    }
    // Fallback to generic token
    else if (req.cookies.token) {
      token = req.cookies.token;
    }
    // Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired, please login again'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get user based on role
    let user;
    if (decoded.role === 'vendor') {
      user = await Vendor.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Vendor not found'
        });
      }
      req.userType = 'vendor';
      
      // Check vendor status
      if (user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: `Vendor account is ${user.status}`,
          data: { status: user.status }
        });
      }
    } 
    else if (['admin', 'super_admin', 'moderator'].includes(decoded.role)) {
      user = await Admin.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or inactive'
        });
      }
      req.userType = 'admin';
      req.admin = user;
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    req.user = user;
    req.user.role = decoded.role;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// ===================================
// ROLE & PERMISSION MIDDLEWARE
// ===================================

export const adminOnly = (req, res, next) => {
  console.log('🔍 adminOnly middleware checking:', {
    userType: req.userType,
    user: req.user?._id,
    email: req.user?.email,
    role: req.user?.role
  });
  
  if (!req.user || req.userType !== 'admin') {
    console.log('❌ adminOnly failed - not admin');
    return res.status(403).json({
      success: false,
      message: 'Access restricted to administrators only'
    });
  }
  console.log('✅ adminOnly passed');
  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Permission middleware (unchanged)
export const canApproveVendors = (req, res, next) => {
  if (!req.admin || !req.admin.permissions?.canApproveVendors) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to approve vendors'
    });
  }
  next();
};

export const canManageVendors = (req, res, next) => {
  if (!req.admin || !req.admin.permissions?.canManageVendors) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to manage vendors'
    });
  }
  next();
};

export const canViewAnalytics = (req, res, next) => {
  if (!req.admin || !req.admin.permissions?.canViewAnalytics) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view analytics'
    });
  }
  next();
};

export const vendorOnly = (req, res, next) => {
  if (!req.user || req.userType !== 'vendor') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to vendors only'
    });
  }
  next();
};

export const checkVendorApproved = async (req, res, next) => {
  try {
    if (req.userType === 'vendor' && req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account pending admin approval',
        data: { 
          status: req.user.status,
          rejectionReason: req.user.rejectionReason,
          suspensionReason: req.user.suspensionReason
        }
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

