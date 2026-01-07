import jwt from 'jsonwebtoken';
import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie
    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user type and get user
    if (decoded.role === 'vendor') {
      req.user = await Vendor.findById(decoded.id).select('-password');
      req.userType = 'vendor';
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Vendor not found'
        });
      }
    } else if (['admin', 'super_admin'].includes(decoded.role)) {
      req.user = await Admin.findById(decoded.id).select('-password');
      req.userType = 'admin';
      req.admin = req.user; // Alias for admin routes
      
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or inactive'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    next(error);
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