import express from 'express';
import {
  createOffer,
  acceptOffer,
  counterOffer,
  rejectOffer,
  getReceivedOffers,
  getSentOffers,
  getOfferDetails,
  getOfferStats
} from '../../controllers/vendor/offer.controller.js';
import { vendorProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require vendor authentication
router.use(vendorProtect);

// Stats (put before /:offerId to avoid route conflicts)
router.get('/stats', getOfferStats);

// List offers
router.get('/received', getReceivedOffers);
router.get('/sent', getSentOffers);

// Create offer
router.post('/', createOffer);

// Single offer details
router.get('/:offerId', getOfferDetails);

// Offer actions
router.put('/:offerId/accept', acceptOffer);
router.put('/:offerId/counter', counterOffer);
router.put('/:offerId/reject', rejectOffer);

export default router;