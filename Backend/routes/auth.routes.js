import express from 'express';
import {
  vendorLogin,
  adminLogin,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validation.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/vendor/login', validateLogin, vendorLogin);
router.post('/admin/login', validateLogin, adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

export default router;