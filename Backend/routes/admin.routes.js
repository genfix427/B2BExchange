import express from 'express';
import {
  getPendingVendors,
  getVendorDetails,
  approveVendor,
  rejectVendor,
  getAllVendors
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Vendor management routes
router.get('/vendors/pending', getPendingVendors);
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorDetails);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);

export default router;