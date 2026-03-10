// src/store/slices/offerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offerService } from '../../services/offer.service';

// Helper to transform backend offer data to frontend format
const transformOffer = (offer) => {
  return {
    ...offer,
    // Map backend fields to frontend expectations
    offerPrice: offer.offeredPrice,
    productNDC: offer.ndcNumber,
    buyerVendorName: offer.buyer?.pharmacyInfo?.legalBusinessName || 
                     offer.buyer?.pharmacyInfo?.dba || 
                     'Unknown Buyer',
    sellerVendorName: offer.seller?.pharmacyInfo?.legalBusinessName || 
                     offer.seller?.pharmacyInfo?.dba || 
                     'Unknown Seller',
    productImage: offer.productSnapshot?.image || offer.product?.image || null,
    convertedOrder: offer.resultingOrder,
    // Ensure productSnapshot exists
    productSnapshot: offer.productSnapshot || {
      dosageForm: offer.product?.dosageForm,
      strength: offer.product?.strength,
      manufacturer: offer.manufacturer,
      expirationDate: offer.product?.expirationDate
    }
  };
};

// Async thunks
export const createOffer = createAsyncThunk(
  'offers/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await offerService.createOffer(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create offer');
    }
  }
);

export const fetchReceivedOffers = createAsyncThunk(
  'offers/fetchReceived',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await offerService.getReceivedOffers(params);
      return {
        data: response.data.map(transformOffer),
        pagination: response.pagination
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch received offers');
    }
  }
);

export const fetchSentOffers = createAsyncThunk(
  'offers/fetchSent',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await offerService.getSentOffers(params);
      return {
        data: response.data.map(transformOffer),
        pagination: response.pagination
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sent offers');
    }
  }
);

export const fetchOfferDetails = createAsyncThunk(
  'offers/fetchDetails',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.getOfferDetails(offerId);
      return transformOffer(response.data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch offer details');
    }
  }
);

export const fetchOfferStats = createAsyncThunk(
  'offers/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await offerService.getOfferStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch offer stats');
    }
  }
);

export const acceptOffer = createAsyncThunk(
  'offers/accept',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.acceptOffer(offerId);
      return {
        offer: transformOffer(response.data.offer),
        order: response.data.order
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to accept offer');
    }
  }
);

export const rejectOffer = createAsyncThunk(
  'offers/reject',
  async ({ offerId, reason }, { rejectWithValue }) => {
    try {
      const response = await offerService.rejectOffer(offerId, reason);
      return transformOffer(response.data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject offer');
    }
  }
);

export const counterOffer = createAsyncThunk(
  'offers/counter',
  async ({ offerId, counterPrice, counterMessage }, { rejectWithValue }) => {
    try {
      const response = await offerService.counterOffer(offerId, { counterPrice, counterMessage });
      return transformOffer(response.data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send counter offer');
    }
  }
);

export const cancelOffer = createAsyncThunk(
  'offers/cancel',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.cancelOffer(offerId);
      return transformOffer(response.data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel offer');
    }
  }
);

const offerSlice = createSlice({
  name: 'offers',
  initialState: {
    receivedOffers: [],
    sentOffers: [],
    currentOffer: null,
    stats: {
      received: { total: 0, pending: 0, countered: 0, accepted: 0, rejected: 0, expired: 0, cancelled: 0 },
      sent: { total: 0, pending: 0, countered: 0, accepted: 0, rejected: 0, expired: 0, cancelled: 0 }
    },
    counts: {
      received: 0,
      sent: 0,
      receivedPending: 0,
      sentPending: 0,
      total: 0
    },
    receivedPagination: { page: 1, limit: 10, total: 0, pages: 1 },
    sentPagination: { page: 1, limit: 10, total: 0, pages: 1 },
    loading: false,
    actionLoading: false,
    error: null,
    actionError: null,
    successMessage: null
  },
  reducers: {
    clearOfferError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetOfferState: (state) => {
      state.currentOffer = null;
      state.error = null;
      state.actionError = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create offer
      .addCase(createOffer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createOffer.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = 'Offer submitted successfully!';
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Fetch received offers
      .addCase(fetchReceivedOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceivedOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedOffers = action.payload.data;
        state.receivedPagination = action.payload.pagination;
        
        // Update counts
        state.counts.received = action.payload.pagination.total;
        state.counts.receivedPending = action.payload.data.filter(o => o.status === 'pending').length;
        state.counts.total = state.counts.received + state.counts.sent;
      })
      .addCase(fetchReceivedOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch sent offers
      .addCase(fetchSentOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSentOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.sentOffers = action.payload.data;
        state.sentPagination = action.payload.pagination;
        
        // Update counts
        state.counts.sent = action.payload.pagination.total;
        state.counts.sentPending = action.payload.data.filter(o => o.status === 'pending').length;
        state.counts.total = state.counts.received + state.counts.sent;
      })
      .addCase(fetchSentOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch offer details
      .addCase(fetchOfferDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOfferDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOffer = action.payload;
      })
      .addCase(fetchOfferDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch stats
      .addCase(fetchOfferStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        
        // Update counts from stats
        state.counts.received = action.payload.received.total;
        state.counts.sent = action.payload.sent.total;
        state.counts.receivedPending = action.payload.received.pending;
        state.counts.sentPending = action.payload.sent.pending;
        state.counts.total = action.payload.received.total + action.payload.sent.total;
      })

      // Accept offer
      .addCase(acceptOffer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Offer accepted! Order has been created.';
        
        // Update the offer in both lists
        const updateOfferInList = (list) => {
          const index = list.findIndex(o => o._id === action.payload.offer._id);
          if (index !== -1) {
            list[index] = action.payload.offer;
          }
        };
        
        updateOfferInList(state.receivedOffers);
        updateOfferInList(state.sentOffers);
      })
      .addCase(acceptOffer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Reject offer
      .addCase(rejectOffer.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rejectOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.status === 'cancelled' 
          ? 'Offer cancelled.' 
          : 'Offer rejected.';
        
        const updateOfferInList = (list) => {
          const index = list.findIndex(o => o._id === action.payload._id);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        
        updateOfferInList(state.receivedOffers);
        updateOfferInList(state.sentOffers);
      })
      .addCase(rejectOffer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Counter offer
      .addCase(counterOffer.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(counterOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Counter offer sent!';
        
        const index = state.receivedOffers.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.receivedOffers[index] = action.payload;
        }
      })
      .addCase(counterOffer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Cancel offer
      .addCase(cancelOffer.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(cancelOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Offer cancelled.';
        
        const index = state.sentOffers.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.sentOffers[index] = action.payload;
        }
      })
      .addCase(cancelOffer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
});

export const { clearOfferError, clearSuccessMessage, resetOfferState } = offerSlice.actions;

// Selectors
export const selectReceivedOffers = (state) => state.offers.receivedOffers;
export const selectSentOffers = (state) => state.offers.sentOffers;
export const selectOfferCounts = (state) => state.offers.counts;
export const selectOfferStats = (state) => state.offers.stats;
export const selectOfferLoading = (state) => state.offers.loading;
export const selectActionLoading = (state) => state.offers.actionLoading;

export default offerSlice.reducer;