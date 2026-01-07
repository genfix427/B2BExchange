import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vendorService } from '../../services/vendor.service'

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (filters, { rejectWithValue }) => {
    try {
      console.log('Fetching vendors with filters:', filters)
      const response = await vendorService.getVendors(filters)
      console.log('FetchVendors response:', response)
      
      // Extract data from the response structure
      const vendors = response.data || []
      const pagination = response.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: vendors.length,
        pages: Math.ceil(vendors.length / (filters.limit || 10))
      }
      
      console.log('Extracted vendors:', vendors)
      console.log('Extracted pagination:', pagination)
      
      return { vendors, pagination }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const fetchVendorDetails = createAsyncThunk(
  'vendors/fetchVendorDetails',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await vendorService.getVendorDetails(vendorId)
      return response.data || response
    } catch (error) {
      console.error('Error fetching vendor details:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPendingVendors = createAsyncThunk(
  'vendors/fetchPendingVendors',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log('Fetching pending vendors, page:', page, 'limit:', limit)
      const response = await vendorService.getPendingVendors(page, limit)
      console.log('FetchPendingVendors response:', response)
      
      // Extract data from the response structure
      const vendors = response.data || []
      const pagination = response.pagination || {
        page,
        limit,
        total: vendors.length,
        pages: Math.ceil(vendors.length / limit)
      }
      
      console.log('Extracted pending vendors:', vendors)
      console.log('Extracted pending pagination:', pagination)
      
      return { vendors, pagination }
    } catch (error) {
      console.error('Error fetching pending vendors:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const approveVendor = createAsyncThunk(
  'vendors/approveVendor',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await vendorService.approveVendor(vendorId)
      return { vendorId, data: response.data || response }
    } catch (error) {
      console.error('Error approving vendor:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const rejectVendor = createAsyncThunk(
  'vendors/rejectVendor',
  async ({ vendorId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await vendorService.rejectVendor(vendorId, rejectionReason)
      return { vendorId, data: response.data || response }
    } catch (error) {
      console.error('Error rejecting vendor:', error)
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  vendors: [],
  selectedVendor: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    search: ''
  },
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  }
}

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null
    },
    resetVendors: (state) => {
      state.vendors = []
      state.pagination = initialState.pagination
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false
        state.vendors = action.payload.vendors || []
        state.pagination = action.payload.pagination || initialState.pagination
        console.log('Redux state updated with vendors:', state.vendors.length)
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.vendors = []
      })
      
      // Fetch Vendor Details
      .addCase(fetchVendorDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendorDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedVendor = action.payload
      })
      .addCase(fetchVendorDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Pending Vendors
      .addCase(fetchPendingVendors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPendingVendors.fulfilled, (state, action) => {
        state.isLoading = false
        state.vendors = action.payload.vendors || []
        state.pagination = action.payload.pagination || initialState.pagination
        console.log('Redux state updated with pending vendors:', state.vendors.length)
      })
      .addCase(fetchPendingVendors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.vendors = []
      })
      
      // Approve Vendor
      .addCase(approveVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        state.isLoading = false
        // Update vendor status in list
        const vendorIndex = state.vendors.findIndex(v => v._id === action.payload.vendorId)
        if (vendorIndex !== -1) {
          state.vendors[vendorIndex].status = 'approved'
          state.vendors[vendorIndex].approvedAt = new Date().toISOString()
        }
      })
      .addCase(approveVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reject Vendor
      .addCase(rejectVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        state.isLoading = false
        // Update vendor status in list
        const vendorIndex = state.vendors.findIndex(v => v._id === action.payload.vendorId)
        if (vendorIndex !== -1) {
          state.vendors[vendorIndex].status = 'rejected'
        }
      })
      .addCase(rejectVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  setSelectedVendor, 
  clearSelectedVendor,
  resetVendors
} = vendorSlice.actions

export default vendorSlice.reducer