// src/store/slices/offerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offerService } from '../../services/offer.service';

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
      return response;
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
      return response;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch offer details');
    }
  }
);

export const fetchOfferCounts = createAsyncThunk(
  'offers/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await offerService.getOfferCounts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch offer counts');
    }
  }
);

export const acceptOffer = createAsyncThunk(
  'offers/accept',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.acceptOffer(offerId);
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send counter offer');
    }
  }
);

export const acceptCounterOffer = createAsyncThunk(
  'offers/acceptCounter',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.acceptCounterOffer(offerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to accept counter offer');
    }
  }
);

export const rejectCounterOffer = createAsyncThunk(
  'offers/rejectCounter',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.rejectCounterOffer(offerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject counter offer');
    }
  }
);

export const cancelOffer = createAsyncThunk(
  'offers/cancel',
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await offerService.cancelOffer(offerId);
      return response.data;
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
      .addCase(createOffer.fulfilled, (state, action) => {
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

      // Fetch counts
      .addCase(fetchOfferCounts.fulfilled, (state, action) => {
        state.counts = action.payload;
      })

      // Accept offer
      .addCase(acceptOffer.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Offer accepted! Order has been created.';
        // Update the offer in the list
        const index = state.receivedOffers.findIndex(o => o._id === action.payload.offer._id);
        if (index !== -1) {
          state.receivedOffers[index] = action.payload.offer;
        }
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
        state.successMessage = 'Offer rejected.';
        const index = state.receivedOffers.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.receivedOffers[index] = action.payload;
        }
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

      // Accept counter
      .addCase(acceptCounterOffer.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(acceptCounterOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Counter offer accepted! Order created.';
        const index = state.sentOffers.findIndex(o => o._id === action.payload.offer._id);
        if (index !== -1) {
          state.sentOffers[index] = action.payload.offer;
        }
      })
      .addCase(acceptCounterOffer.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Reject counter
      .addCase(rejectCounterOffer.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rejectCounterOffer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Counter offer rejected.';
        const index = state.sentOffers.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.sentOffers[index] = action.payload;
        }
      })
      .addCase(rejectCounterOffer.rejected, (state, action) => {
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
export const selectOfferLoading = (state) => state.offers.loading;
export const selectActionLoading = (state) => state.offers.actionLoading;

export default offerSlice.reducer;