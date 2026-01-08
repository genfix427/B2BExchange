import express from 'express';
import {
  adminLogin,
  adminLogout,
  getCurrentAdmin,
  adminForgotPassword,
  adminResetPassword
} from '../controllers/adminAuth.controller.js';
import { validateLogin } from '../middleware/validation.middleware.js';
import { adminProtect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public admin routes
router.post('/login', validateLogin, adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password/:token', adminResetPassword);

// Protected admin routes
router.get('/me', adminProtect, getCurrentAdmin);
router.post('/logout', adminProtect, adminLogout);

export default router;