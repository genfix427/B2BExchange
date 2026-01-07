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
  (req, res, next) => {
    // Log incoming request for debugging
    console.log('Registration request received');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    next();
  },
  uploadDocuments,
  handleUploadError,
  validateRegistration,
  registerVendor
);

// Debug route to test file upload
router.post('/register-test', uploadDocuments, handleUploadError, (req, res) => {
  console.log('Files received:', req.files?.length || 0);
  console.log('Body:', req.body);
  
  res.status(200).json({
    success: true,
    message: 'File upload test successful',
    filesCount: req.files?.length || 0,
    body: req.body
  });
});

// Protected vendor routes
router.use(protect);
router.use(vendorOnly);
router.use(checkVendorApproved);

router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

export default router;