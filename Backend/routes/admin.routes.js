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
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Admin profile routes
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// Vendor management routes
router.get('/vendors/pending', getPendingVendors);
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorDetails);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);
router.put('/vendors/:id/reactivate', reactivateVendor);

// Dashboard stats
router.get('/dashboard/stats', getAdminDashboardStats);
router.get('/stats/vendors', getVendorStats);

export default router;