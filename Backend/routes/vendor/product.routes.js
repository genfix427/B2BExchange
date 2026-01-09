// routes/vendor/product.routes.js
import express from 'express';
import {
  createProduct,
  getVendorProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from '../../controllers/vendor/product.controller.js';
import { vendorProtect } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = express.Router();

// All routes are protected for vendors
router.use(vendorProtect);

router.route('/')
  .get(getVendorProducts)
  .post(upload.single('image'), createProduct);

router.route('/stats')
  .get(getProductStats);

router.route('/:id')
  .get(getProduct)
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

export default router;