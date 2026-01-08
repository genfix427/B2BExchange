import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {vendorService} from '../../services/vendor.service'

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

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
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
  }
})

export const { 
  clearVendorError, 
  clearUpdateSuccess, 
  updateProfileField,
  setStats 
} = vendorSlice.actions

export default vendorSlice.reducer