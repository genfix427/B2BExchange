// src/services/offer.service.js
import { api } from './api';

export const offerService = {
  // Create a new offer
  createOffer(data) {
    // Transform frontend field names to backend expectations
    const transformedData = {
      productId: data.productId,
      quantity: data.quantity,
      offeredPrice: data.offerPrice, // Map offerPrice to offeredPrice
      message: data.message
    };
    return api.post('/vendor/offers', transformedData);
  },

  // Get received offers (as seller)
  getReceivedOffers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    return api.get(`/vendor/offers/received?${query.toString()}`);
  },

  // Get sent offers (as buyer)
  getSentOffers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    return api.get(`/vendor/offers/sent?${query.toString()}`);
  },

  // Get offer details
  getOfferDetails(offerId) {
    return api.get(`/vendor/offers/${offerId}`);
  },

  // Get offer stats
  getOfferStats() {
    return api.get('/vendor/offers/stats');
  },

  // Accept offer (seller accepts buyer's offer OR buyer accepts seller's counter)
  acceptOffer(offerId) {
    return api.put(`/vendor/offers/${offerId}/accept`);
  },

  // Reject offer (seller or buyer)
  rejectOffer(offerId, reason = '') {
    return api.put(`/vendor/offers/${offerId}/reject`, { reason });
  },

  // Counter offer (seller only)
  counterOffer(offerId, data) {
    return api.put(`/vendor/offers/${offerId}/counter`, {
      counterPrice: data.counterPrice,
      message: data.counterMessage
    });
  },

  // Cancel offer (buyer only)
  cancelOffer(offerId) {
    return api.put(`/vendor/offers/${offerId}/reject`); // reject endpoint handles cancellation
  }
};