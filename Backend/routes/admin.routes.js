// routes/admin.routes.js
import express from 'express';
import {
  getPendingVendors,
  getVendorDetails,
  approveVendor,
  rejectVendor,
  getAllVendors,
  getVendorStats,
  suspendVendor,
  reactivateVendor,
  getAdminProfile,
  updateAdminProfile,
  getAdminDashboardStats
} from '../controllers/admin.controller.js';

import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus
} from '../controllers/adminManagement.controller.js';

import {
  adminProtect,
  adminOnly,
  canApproveVendors,
  canManageVendors,
  canManageAdmins  // ← NEW
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply adminProtect to ALL admin routes
router.use(adminProtect);
router.use(adminOnly);

// ─── Admin profile routes ───
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// ─── Vendor management routes ───
router.get('/vendors/pending', canApproveVendors, getPendingVendors);
router.get('/vendors', canManageVendors, getAllVendors);
router.get('/vendors/:id', canManageVendors, getVendorDetails);
router.put('/vendors/:id/approve', canApproveVendors, approveVendor);
router.put('/vendors/:id/reject', canApproveVendors, rejectVendor);
router.put('/vendors/:id/suspend', canManageVendors, suspendVendor);
router.put('/vendors/:id/reactivate', canManageVendors, reactivateVendor);

// ─── Admin management routes (NEW) ───
router.post('/admins', canManageAdmins, createAdmin);
router.get('/admins', canManageAdmins, getAllAdmins);
router.get('/admins/:id', canManageAdmins, getAdminById);
router.put('/admins/:id', canManageAdmins, updateAdmin);
router.delete('/admins/:id', canManageAdmins, deleteAdmin);
router.put('/admins/:id/toggle-status', canManageAdmins, toggleAdminStatus);

// ─── Dashboard stats ───
router.get('/dashboard/stats', getAdminDashboardStats);
router.get('/stats/vendors', getVendorStats);

export default router;