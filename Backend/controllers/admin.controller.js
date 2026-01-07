import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';
import { sendVendorApprovalEmail } from '../services/email.service.js';

// @desc    Get pending vendors
// @route   GET /api/admin/vendors/pending
// @access  Private (Admin)
export const getPendingVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find({ status: 'pending' })
      .select('pharmacyInfo.legalBusinessName pharmacyInfo.npiNumber pharmacyOwner.email registeredAt')
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor details
// @route   GET /api/admin/vendors/:id
// @access  Private (Admin)
export const getVendorDetails = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-password')
      .populate('approvedBy', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private (Admin with permission)
export const approveVendor = async (req, res, next) => {
  try {
    // Check admin permissions
    if (!req.admin.permissions.canApproveVendors) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve vendors'
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Vendor is already ${vendor.status}`
      });
    }

    // Update vendor status
    vendor.status = 'approved';
    vendor.approvedBy = req.admin._id;
    vendor.approvedAt = new Date();
    await vendor.save();

    // Send approval email
    await sendVendorApprovalEmail(
      vendor.pharmacyOwner.email,
      `${vendor.pharmacyOwner.firstName} ${vendor.pharmacyOwner.lastName}`
    );

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: {
        id: vendor._id,
        status: vendor.status,
        approvedAt: vendor.approvedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject vendor
// @route   PUT /api/admin/vendors/:id/reject
// @access  Private (Admin with permission)
export const rejectVendor = async (req, res, next) => {
  try {
    if (!req.admin.permissions.canApproveVendors) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject vendors'
      });
    }

    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed rejection reason (min 10 characters)'
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Vendor is already ${vendor.status}`
      });
    }

    vendor.status = 'rejected';
    vendor.rejectionReason = rejectionReason;
    vendor.approvedBy = req.admin._id; // Still track who rejected
    await vendor.save();

    // TODO: Send rejection email (implement similar to approval email)

    res.status(200).json({
      success: true,
      message: 'Vendor rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin)
export const getAllVendors = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'pharmacyInfo.legalBusinessName': { $regex: search, $options: 'i' } },
        { 'pharmacyInfo.npiNumber': { $regex: search, $options: 'i' } },
        { 'pharmacyOwner.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const vendors = await Vendor.find(query)
      .select('pharmacyInfo.legalBusinessName pharmacyInfo.npiNumber pharmacyOwner.email status registeredAt approvedAt')
      .populate('approvedBy', 'firstName lastName')
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Vendor.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};