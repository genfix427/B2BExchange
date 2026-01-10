// routes/store/checkout.routes.js
import express from 'express';
import { vendorProtect } from '../../middleware/auth.middleware.js';
import {
  createOrder,
  getShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress
} from '../../controllers/store/checkout.controller.js';

const router = express.Router();

// All routes protected for vendors
router.use(vendorProtect);

// Order routes
router.post('/orders', createOrder);

// Shipping address routes
router.route('/shipping-addresses')
  .get(getShippingAddresses)
  .post(addShippingAddress);

router.route('/shipping-addresses/:id')
  .put(updateShippingAddress)
  .delete(deleteShippingAddress);

router.put('/shipping-addresses/:id/default', setDefaultShippingAddress);

export default router;