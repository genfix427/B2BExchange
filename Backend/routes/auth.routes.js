import express from 'express';
import {
  vendorLogin,
  vendorLogout,
  getCurrentVendor,
  vendorForgotPassword,
  vendorResetPassword,
  updateVendorProfile
} from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validation.middleware.js';
import { vendorProtect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public vendor routes
router.post('/login', validateLogin, vendorLogin);
router.post('/forgot-password', vendorForgotPassword);
router.post('/reset-password/:token', vendorResetPassword);

// Protected vendor routes
router.get('/me', vendorProtect, getCurrentVendor);
router.post('/logout', vendorProtect, vendorLogout);
router.put('/profile', vendorProtect, updateVendorProfile);

export default router;