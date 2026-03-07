// routes/vendor/offer.routes.js
import express from 'express';
import {
  createOffer,
  getReceivedOffers,
  getSentOffers,
  getOfferDetails,
  acceptOffer,
  rejectOffer,
  counterOffer,
  acceptCounterOffer,
  rejectCounterOffer,
  cancelOffer,
  getOfferCounts
} from '../../controllers/vendor/offer.controller.js';
import { vendorProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(vendorProtect);

// Offer CRUD
router.post('/', createOffer);
router.get('/received', getReceivedOffers);
router.get('/sent', getSentOffers);
router.get('/counts', getOfferCounts);
router.get('/:id', getOfferDetails);

// Offer actions
router.put('/:id/accept', acceptOffer);
router.put('/:id/reject', rejectOffer);
router.put('/:id/counter', counterOffer);
router.put('/:id/accept-counter', acceptCounterOffer);
router.put('/:id/reject-counter', rejectCounterOffer);
router.put('/:id/cancel', cancelOffer);

export default router;