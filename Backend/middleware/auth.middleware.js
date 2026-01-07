import jwt from 'jsonwebtoken';
import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from cookie (primary method)
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 2. Get token from Authorization header (fallback)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
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
          message: 'Session expired, please login again'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // 4. Check token structure
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // 5. Get user from database based on role
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
    } else if (['admin', 'super_admin'].includes(decoded.role)) {
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

    // 6. Attach user to request
    req.user = user;
    req.user.role = decoded.role; // Ensure role is set

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
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

export const vendorOnly = (req, res, next) => {
  if (req.userType !== 'vendor') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to vendors only'
    });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to administrators only'
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
        data: { status: req.user.status }
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};