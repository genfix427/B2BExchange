import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes for all authenticated users
router.use(protect);

// Basic profile routes (extend as needed)
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

export default router;