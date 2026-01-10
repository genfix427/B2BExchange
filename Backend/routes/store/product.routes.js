// routes/store/product.routes.js - UPDATED
import express from 'express';
import { vendorProtect } from '../../middleware/auth.middleware.js';
import {
  getStoreProducts,
  getStoreProduct,
  getFeaturedProducts,
  searchProducts,
  getFilters
} from '../../controllers/store/product.controller.js';

const router = express.Router();

// ✅ Apply vendorProtect middleware to all routes
router.use(vendorProtect);

// All routes now require vendor authentication
router.get('/', getStoreProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/filters', getFilters);
router.get('/:id', getStoreProduct);

export default router;