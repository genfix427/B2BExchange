import express from 'express';
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile
} from '../controllers/vendor.controller.js';
import { uploadDocuments, handleUploadError } from '../middleware/upload.middleware.js';
import { validateRegistration } from '../middleware/validation.middleware.js';
import { protect, vendorOnly, checkVendorApproved } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  uploadDocuments,
  handleUploadError,
  validateRegistration,
  registerVendor
);

// Protected vendor routes
router.use(protect);
router.use(vendorOnly);
router.use(checkVendorApproved);

router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

export default router;