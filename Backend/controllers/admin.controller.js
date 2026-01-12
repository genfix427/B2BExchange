import Vendor from '../models/Vendor.model.js';
import Admin from '../models/Admin.model.js';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../services/email.service.js';
import { format } from 'date-fns';

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
export const getAdminProfile = async (req, res, next) => {
  try {
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
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update basic info
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email) admin.email = email;

    // Update password if provided
    if (currentPassword && newPassword) {
      const isPasswordValid = await admin.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      admin.password = newPassword;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    // Get vendor statistics
    const vendorStats = await Vendor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format vendor stats
    const stats = {
      totalVendors: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0
    };

    vendorStats.forEach(stat => {
      stats.totalVendors += stat.count;
      stats[stat._id] = stat.count;
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await Vendor.countDocuments({
      registeredAt: { $gte: thirtyDaysAgo }
    });

    // Get today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysRegistrations = await Vendor.countDocuments({
      registeredAt: { $gte: today, $lt: tomorrow }
    });

    // Get revenue statistics (placeholder - integrate with payment system)
    const revenueStats = {
      totalRevenue: 1245820,
      monthlyRevenue: 154820,
      averageOrderValue: 2450,
      growthRate: 12.5
    };

    res.status(200).json({
      success: true,
      data: {
        vendors: stats,
        registrations: {
          total: stats.totalVendors,
          recent: recentRegistrations,
          today: todaysRegistrations,
          growth: recentRegistrations > 0 ? 
            Math.round((todaysRegistrations / recentRegistrations) * 100) : 0
        },
        revenue: revenueStats,
        system: {
          uptime: 99.9,
          activeUsers: 156,
          queueSize: 3,
          apiHealth: 'healthy'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor statistics
// @route   GET /api/admin/stats/vendors
// @access  Private (Admin)
export const getVendorStats = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get registration trends
    const registrationTrend = await Vendor.aggregate([
      {
        $match: {
          registeredAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$registeredAt' },
            month: { $month: '$registeredAt' },
            day: { $dayOfMonth: '$registeredAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get vendor status distribution
    const statusDistribution = await Vendor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get geographic distribution
    const geographicDistribution = await Vendor.aggregate([
      {
        $group: {
          _id: '$pharmacyInfo.shippingAddress.state',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get top performing vendors (placeholder - integrate with order data)
    const topVendors = await Vendor.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $sample: { size: 5 }
      },
      {
        $project: {
          name: '$pharmacyInfo.legalBusinessName',
          state: '$pharmacyInfo.shippingAddress.state',
          registeredAt: 1,
          status: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        registrationTrend,
        statusDistribution,
        geographicDistribution,
        topVendors,
        summary: {
          total: await Vendor.countDocuments(),
          active: await Vendor.countDocuments({ status: 'approved' }),
          pending: await Vendor.countDocuments({ status: 'pending' }),
          growth: registrationTrend.length > 0 ? 
            Math.round((registrationTrend[registrationTrend.length - 1].count / 
              registrationTrend[0].count) * 100) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending vendors
// @route   GET /api/admin/vendors/pending
// @access  Private (Admin)
export const getPendingVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find({ status: 'pending' })
      .select('pharmacyInfo pharmacyOwner email status registeredAt documents')
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

    const vendorData = vendor.toObject();
    const isAdmin = req.user?.role === 'admin';

    if (vendorData.bankAccount) {
      const {
        accountHolderName,
        bankName,
        accountType,
        routingNumber,
        accountNumber,
        bankAddress,
        bankPhone,
        achAuthorization,
        authorizationDate
      } = vendorData.bankAccount;

      vendorData.bankAccount = {
        accountHolderName,
        bankName,
        accountType,

        // ✅ always send masked
        maskedRoutingNumber: routingNumber
          ? `****${routingNumber.slice(-4)}`
          : null,

        maskedAccountNumber: accountNumber
          ? `****${accountNumber.slice(-4)}`
          : null,

        // ✅ send raw ONLY to admin
        ...(isAdmin && {
          routingNumber,
          accountNumber
        }),

        bankAddress,
        bankPhone,
        achAuthorization,
        authorizationDate
      };
    }

    res.status(200).json({
      success: true,
      data: vendorData
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
    if (!req.admin.permissions?.canApproveVendors) {
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
    if (!req.admin.permissions?.canApproveVendors) {
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
    vendor.approvedBy = req.admin._id;
    await vendor.save();

    // Send rejection email
    await sendVendorRejectionEmail(
      vendor.pharmacyOwner.email,
      `${vendor.pharmacyOwner.firstName} ${vendor.pharmacyOwner.lastName}`,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      message: 'Vendor rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend vendor
// @route   PUT /api/admin/vendors/:id/suspend
// @access  Private (Admin with permission)
export const suspendVendor = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a suspension reason (min 5 characters)'
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Vendor is already suspended'
      });
    }

    const previousStatus = vendor.status;
    vendor.status = 'suspended';
    vendor.suspensionReason = reason;
    vendor.suspendedBy = req.admin._id;
    vendor.suspendedAt = new Date();
    vendor.previousStatus = previousStatus;
    await vendor.save();

    // TODO: Send suspension email

    res.status(200).json({
      success: true,
      message: 'Vendor suspended successfully',
      data: {
        id: vendor._id,
        status: vendor.status,
        suspendedAt: vendor.suspendedAt,
        reason: vendor.suspensionReason
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate vendor
// @route   PUT /api/admin/vendors/:id/reactivate
// @access  Private (Admin with permission)
export const reactivateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Vendor is not suspended'
      });
    }

    vendor.status = vendor.previousStatus || 'approved';
    vendor.suspensionReason = undefined;
    vendor.suspendedBy = undefined;
    vendor.suspendedAt = undefined;
    vendor.previousStatus = undefined;
    await vendor.save();

    // TODO: Send reactivation email

    res.status(200).json({
      success: true,
      message: 'Vendor reactivated successfully',
      data: {
        id: vendor._id,
        status: vendor.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin)
// In admin.controller.js - Update getAllVendors function
export const getAllVendors = async (req, res, next) => {
  try {
    console.log('📊 Admin fetching all vendors:', {
      adminId: req.admin?._id,
      email: req.admin?.email,
      query: req.query
    })
    
    const { 
      status, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'registeredAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'pharmacyInfo.legalBusinessName': { $regex: search, $options: 'i' } },
        { 'pharmacyInfo.npiNumber': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'pharmacyInfo.dba': { $regex: search, $options: 'i' } },
        { 'pharmacyLicense.deaNumber': { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Query for vendors:', query)
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Ensure documents field is included
    const vendors = await Vendor.find(query)
      .select('pharmacyInfo pharmacyOwner email status registeredAt approvedAt documents') // Add documents here
      .populate('approvedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${vendors.length} vendors`)
    
    // Log first vendor's document count
    if (vendors.length > 0) {
      vendors.forEach((vendor, index) => {
        console.log(`📄 Vendor ${index + 1} (${vendor._id}):`, {
          businessName: vendor.pharmacyInfo?.legalBusinessName,
          hasDocumentsField: 'documents' in vendor,
          documentsCount: vendor.documents?.length || 0,
          documents: vendor.documents ? 'Has documents array' : 'No documents'
        })
      })
    }
    
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
    console.error('❌ Error in getAllVendors:', error)
    next(error);
  }
};