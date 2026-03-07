// src/services/offer.service.js
import { api } from './api';

export const offerService = {
  // Create a new offer
  createOffer(data) {
    return api.post('/vendor/offers', data);
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

  // Get offer counts (for badges)
  getOfferCounts() {
    return api.get('/vendor/offers/counts');
  },

  // Accept offer (seller)
  acceptOffer(offerId) {
    return api.put(`/vendor/offers/${offerId}/accept`);
  },

  // Reject offer (seller)
  rejectOffer(offerId, reason = '') {
    return api.put(`/vendor/offers/${offerId}/reject`, { reason });
  },

  // Counter offer (seller)
  counterOffer(offerId, data) {
    return api.put(`/vendor/offers/${offerId}/counter`, data);
  },

  // Accept counter offer (buyer)
  acceptCounterOffer(offerId) {
    return api.put(`/vendor/offers/${offerId}/accept-counter`);
  },

  // Reject counter offer (buyer)
  rejectCounterOffer(offerId) {
    return api.put(`/vendor/offers/${offerId}/reject-counter`);
  },

  // Cancel offer (buyer)
  cancelOffer(offerId) {
    return api.put(`/vendor/offers/${offerId}/cancel`);
  }
};