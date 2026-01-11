// routes/store/cart.routes.js
import express from 'express';
import { vendorProtect } from '../../middleware/auth.middleware.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
} from '../../controllers/store/cart.controller.js';

const router = express.Router();

// All routes protected for vendors
router.use(vendorProtect);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.route('/validate') // Add this route
  .get(validateCart);

router.route('/items')
  .post(addToCart);

router.route('/items/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;