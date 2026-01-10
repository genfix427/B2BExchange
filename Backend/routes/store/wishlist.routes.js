// routes/store/wishlist.routes.js
import express from 'express';
import { vendorProtect } from '../../middleware/auth.middleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart
} from '../../controllers/store/wishlist.controller.js';

const router = express.Router();

// All routes protected for vendors
router.use(vendorProtect);

router.route('/')
  .get(getWishlist);

router.route('/items')
  .post(addToWishlist);

router.route('/items/:productId')
  .delete(removeFromWishlist);

router.route('/items/:productId/move-to-cart')
  .post(moveToCart);

export default router;