// routes/vendor/order.routes.js
import express from 'express';
import { 
  getVendorOrders, 
  updateOrderStatus, 
  getVendorOrder,
  getVendorStats
} from '../../controllers/vendor/order.controller.js';
import { vendorProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes protected for vendors
router.use(vendorProtect);

router.get('/stats', getVendorStats);
router.get('/', getVendorOrders);
router.get('/:id', getVendorOrder);
router.put('/:id/status', updateOrderStatus);

export default router;