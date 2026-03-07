// controllers/adminManagement.controller.js
import Admin from '../models/Admin.model.js';
import validator from 'validator';

// @desc    Create a new admin
// @route   POST /api/admin/admins
// @access  Private (Admin with canManageAdmins)
export const createAdmin = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      permissions,
      notes
    } = req.body;

    // ─── Validation ───
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email, and password are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // ─── Role escalation prevention ───
    const requestingAdmin = req.admin;
    const requestedRole = role || 'admin';

    // Only super_admin can create another super_admin
    if (requestedRole === 'super_admin' && requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can create other super admins'
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'An admin with this email already exists'
      });
    }

    // ─── Build permissions ───
    const rolePermissionDefaults = {
      super_admin: {
        canApproveVendors: true,
        canManageVendors: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canSuspendVendors: true,
        canManageAdmins: true
      },
      admin: {
        canApproveVendors: true,
        canManageVendors: true,
        canViewAnalytics: true,
        canManageSettings: false,
        canSuspendVendors: true,
        canManageAdmins: false
      },
      moderator: {
        canApproveVendors: false,
        canManageVendors: true,
        canViewAnalytics: true,
        canManageSettings: false,
        canSuspendVendors: false,
        canManageAdmins: false
      }
    };

    // Non-super_admin cannot grant canManageAdmins or canManageSettings
    let finalPermissions = {
      ...rolePermissionDefaults[requestedRole],
      ...(permissions || {})
    };

    if (requestingAdmin.role !== 'super_admin') {
      finalPermissions.canManageAdmins = false;
      finalPermissions.canManageSettings = false;
    }

    // ─── Create Admin ───
    const newAdmin = await Admin.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: requestedRole,
      phone: phone || undefined,
      permissions: finalPermissions,
      notes: notes || undefined,
      isActive: true
    });

    console.log(`✅ New admin created by ${requestingAdmin.email}: ${newAdmin.email} (${newAdmin.role})`);

    // Return without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: adminResponse
    });

  } catch (error) {
    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An admin with this email already exists'
      });
    }
    console.error('❌ Create admin error:', error);
    next(error);
  }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (Admin with canManageAdmins)
export const getAllAdmins = async (req, res, next) => {
  try {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by role
    if (role && ['super_admin', 'admin', 'moderator'].includes(role)) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const admins = await Admin.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(query);

    res.status(200).json({
      success: true,
      data: admins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get all admins error:', error);
    next(error);
  }
};

// @desc    Get single admin by ID
// @route   GET /api/admin/admins/:id
// @access  Private (Admin with canManageAdmins)
export const getAdminById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');

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
    console.error('❌ Get admin by ID error:', error);
    next(error);
  }
};

// @desc    Update an admin
// @route   PUT /api/admin/admins/:id
// @access  Private (Admin with canManageAdmins)
export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingAdmin = req.admin;
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      permissions,
      notes,
      isActive
    } = req.body;

    // Find the target admin
    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // ─── Security checks ───

    // Prevent non-super_admin from modifying a super_admin
    if (targetAdmin.role === 'super_admin' && requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can modify other super admins'
      });
    }

    // Prevent role escalation to super_admin by non-super_admin
    if (role === 'super_admin' && requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can assign the super_admin role'
      });
    }

    // Prevent self-deactivation
    if (requestingAdmin._id.toString() === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Prevent self role-downgrade
    if (requestingAdmin._id.toString() === id && role && role !== requestingAdmin.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // ─── Email uniqueness check ───
    if (email && email.toLowerCase() !== targetAdmin.email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      const emailExists = await Admin.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'An admin with this email already exists'
        });
      }
      targetAdmin.email = email.toLowerCase().trim();
    }

    // ─── Update fields ───
    if (firstName) targetAdmin.firstName = firstName.trim();
    if (lastName) targetAdmin.lastName = lastName.trim();
    if (phone !== undefined) targetAdmin.phone = phone || undefined;
    if (notes !== undefined) targetAdmin.notes = notes || undefined;
    if (isActive !== undefined) targetAdmin.isActive = isActive;

    // Update role
    if (role && ['super_admin', 'admin', 'moderator'].includes(role)) {
      targetAdmin.role = role;
    }

    // Update permissions (with security restrictions)
    if (permissions && typeof permissions === 'object') {
      const permFields = [
        'canApproveVendors',
        'canManageVendors',
        'canViewAnalytics',
        'canManageSettings',
        'canSuspendVendors',
        'canManageAdmins'
      ];

      permFields.forEach(field => {
        if (permissions[field] !== undefined) {
          // Non-super_admin cannot grant sensitive permissions
          if (
            (field === 'canManageAdmins' || field === 'canManageSettings') &&
            requestingAdmin.role !== 'super_admin'
          ) {
            return; // Skip — not allowed
          }
          targetAdmin.permissions[field] = Boolean(permissions[field]);
        }
      });
    }

    // Update password (will be hashed by pre-save hook)
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters'
        });
      }
      targetAdmin.password = password;
    }

    await targetAdmin.save();

    console.log(`✅ Admin ${targetAdmin.email} updated by ${requestingAdmin.email}`);

    // Return without password
    const updatedAdmin = targetAdmin.toObject();
    delete updatedAdmin.password;

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An admin with this email already exists'
      });
    }
    console.error('❌ Update admin error:', error);
    next(error);
  }
};

// @desc    Delete an admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (Admin with canManageAdmins)
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingAdmin = req.admin;

    // Prevent self-deletion
    if (requestingAdmin._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent non-super_admin from deleting a super_admin
    if (targetAdmin.role === 'super_admin' && requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can delete other super admins'
      });
    }

    // Count remaining super_admins
    if (targetAdmin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin', isActive: true });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last super admin. At least one must exist.'
        });
      }
    }

    await Admin.findByIdAndDelete(id);

    console.log(`🗑️ Admin ${targetAdmin.email} deleted by ${requestingAdmin.email}`);

    res.status(200).json({
      success: true,
      message: `Admin "${targetAdmin.firstName} ${targetAdmin.lastName}" deleted successfully`
    });

  } catch (error) {
    console.error('❌ Delete admin error:', error);
    next(error);
  }
};

// @desc    Toggle admin active status
// @route   PUT /api/admin/admins/:id/toggle-status
// @access  Private (Admin with canManageAdmins)
export const toggleAdminStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingAdmin = req.admin;

    // Prevent self-toggle
    if (requestingAdmin._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot toggle your own status'
      });
    }

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent non-super_admin from toggling a super_admin
    if (targetAdmin.role === 'super_admin' && requestingAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can modify other super admins'
      });
    }

    // If deactivating the last super_admin, block it
    if (targetAdmin.role === 'super_admin' && targetAdmin.isActive) {
      const activeSuperAdmins = await Admin.countDocuments({
        role: 'super_admin',
        isActive: true
      });
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active super admin'
        });
      }
    }

    targetAdmin.isActive = !targetAdmin.isActive;
    await targetAdmin.save();

    console.log(
      `🔄 Admin ${targetAdmin.email} ${targetAdmin.isActive ? 'activated' : 'deactivated'} by ${requestingAdmin.email}`
    );

    res.status(200).json({
      success: true,
      message: `Admin ${targetAdmin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: targetAdmin._id,
        isActive: targetAdmin.isActive
      }
    });

  } catch (error) {
    console.error('❌ Toggle admin status error:', error);
    next(error);
  }
};