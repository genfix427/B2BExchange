// routes/admin/product.routes.js
import express from 'express';
import {
  getAllProducts,
  getProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getProductStatsAdmin
} from '../../controllers/admin/product.controller.js';
import { adminProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected for admin
router.use(adminProtect);

router.route('/')
  .get(getAllProducts);

router.route('/stats')
  .get(getProductStatsAdmin);

router.route('/:id')
  .get(getProductAdmin)
  .put(updateProductAdmin)
  .delete(deleteProductAdmin);

export default router;