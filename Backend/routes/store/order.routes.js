// routes/store/order.routes.js - KEEP vendorProtect
import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder 
} from '../../controllers/store/order.controller.js';
import { vendorProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes protected for vendors (as customers)
router.use(vendorProtect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder);

export default router;