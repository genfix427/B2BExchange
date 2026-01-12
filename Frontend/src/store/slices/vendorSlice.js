import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vendorService } from '../../services/vendor.service'

export const fetchVendorProfile = createAsyncThunk(
  'vendor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await vendorService.getProfile()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateVendorProfile = createAsyncThunk(
  'vendor/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await vendorService.updateProfile(profileData)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const uploadDocument = createAsyncThunk(
  'vendor/uploadDocument',
  async ({ file, documentType }, { rejectWithValue }) => {
    try {
      // Note: Implement document upload service if needed
      const data = await vendorService.uploadDocument(file, documentType)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchVendorOrders = createAsyncThunk(
  'vendor/fetchVendorOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vendorService.getVendorOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'vendor/updateOrderStatus',
  async ({ orderId, status, trackingNumber }, { rejectWithValue }) => {
    try {
      const response = await vendorService.updateOrderStatus(orderId, { status, trackingNumber });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

export const fetchVendorOrderDetails = createAsyncThunk(
  'vendor/fetchVendorOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await vendorService.getVendorOrderDetails(orderId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

// vendorSlice.js - Add these thunks
export const fetchVendorBankAccount = createAsyncThunk(
  'vendor/fetchBankAccount',
  async (_, { rejectWithValue }) => {
    try {
      const data = await vendorService.getBankAccount()
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
);

export const updateVendorBankAccount = createAsyncThunk(
  'vendor/updateBankAccount',
  async (bankData, { rejectWithValue }) => {
    try {
      const response = await api.put('/vendors/bank-account', bankData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
);

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  bankAccount: null,
  updateSuccess: false,
  documents: [],
  stats: {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeListings: 0
  }
}

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    clearVendorError: (state) => {
      state.error = null
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false
    },
    updateProfileField: (state, action) => {
      const { section, field, value } = action.payload
      if (state.profile && state.profile[section]) {
        state.profile[section][field] = value
      }
    },
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchVendorProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(fetchVendorProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Profile
      .addCase(updateVendorProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.updateSuccess = false
      })
      .addCase(updateVendorProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.updateSuccess = true
      })
      .addCase(updateVendorProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.updateSuccess = false
      })

      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false
        // Update documents array
        state.documents = [...state.documents, action.payload]
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Vendor Orders
      .addCase(fetchVendorOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendorOrders = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        const index = state.vendorOrders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.vendorOrders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Vendor Order Details
      .addCase(fetchVendorOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVendorOrder = action.payload;
      })
      .addCase(fetchVendorOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add extra reducers
      .addCase(fetchVendorBankAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorBankAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.bankAccount = action.payload.data.bankAccount
      })

      .addCase(fetchVendorBankAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Add for update
      .addCase(updateVendorBankAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateVendorBankAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.bankAccount = action.payload.data?.bankAccount
      })
      .addCase(updateVendorBankAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  clearVendorError,
  clearUpdateSuccess,
  updateProfileField,
  setStats
} = vendorSlice.actions

export default vendorSlice.reducer