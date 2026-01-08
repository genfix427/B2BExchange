// src/store/slices/vendorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vendorService } from '../../services/vendor.service'

// Helper function to extract data from response
const extractResponseData = (response, defaultData = []) => {
  if (!response) return defaultData
  
  if (response.success === false) return defaultData
  
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response)) return response
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    // If data is an object, check for nested arrays
    if (response.data.vendors && Array.isArray(response.data.vendors)) {
      return response.data.vendors
    }
    return defaultData
  }
  
  return defaultData
}

// Helper function to extract pagination
const extractPagination = (response, filters = {}) => {
  const defaultPagination = {
    page: filters.page || 1,
    limit: filters.limit || 10,
    total: 0,
    pages: 1
  }
  
  if (!response) return defaultPagination
  
  if (response.pagination) return response.pagination
  if (response.data && response.data.pagination) return response.data.pagination
  
  // Calculate pagination from data
  const data = extractResponseData(response)
  if (Array.isArray(data)) {
    return {
      ...defaultPagination,
      total: data.length,
      pages: Math.ceil(data.length / defaultPagination.limit)
    }
  }
  
  return defaultPagination
}

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching vendors with filters:', filters)
      const response = await vendorService.getVendors(filters)
      console.log('📡 FetchVendors response:', response)
      
      const vendors = extractResponseData(response)
      const pagination = extractPagination(response, filters)
      
      console.log(`✅ Extracted ${vendors.length} vendors`)
      
      return { 
        vendors, 
        pagination,
        message: response.message || 'Vendors fetched successfully'
      }
    } catch (error) {
      console.error('❌ Error fetching vendors:', error)
      return rejectWithValue(error.message || 'Failed to fetch vendors')
    }
  }
)

export const fetchPendingVendors = createAsyncThunk(
  'vendors/fetchPendingVendors',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching pending vendors, page:', page, 'limit:', limit)
      const response = await vendorService.getPendingVendors(page, limit)
      console.log('📡 FetchPendingVendors response:', response)
      
      const vendors = extractResponseData(response)
      const pagination = extractPagination(response, { page, limit })
      
      console.log(`✅ Extracted ${vendors.length} pending vendors`)
      
      return { 
        vendors, 
        pagination,
        message: response.message || 'Pending vendors fetched successfully'
      }
    } catch (error) {
      console.error('❌ Error fetching pending vendors:', error)
      return rejectWithValue(error.message || 'Failed to fetch pending vendors')
    }
  }
)

export const fetchVendorDetails = createAsyncThunk(
  'vendors/fetchVendorDetails',
  async (vendorId, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching vendor details for:', vendorId)
      const response = await vendorService.getVendorDetails(vendorId)
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to fetch vendor details')
      }
      
      const vendorData = response.data || response
      
      return {
        vendor: vendorData,
        message: response.message || 'Vendor details fetched successfully'
      }
    } catch (error) {
      console.error('❌ Error fetching vendor details:', error)
      return rejectWithValue(error.message || 'Failed to fetch vendor details')
    }
  }
)

export const approveVendor = createAsyncThunk(
  'vendors/approveVendor',
  async (vendorId, { rejectWithValue }) => {
    try {
      console.log('✅ Approving vendor:', vendorId)
      const response = await vendorService.approveVendor(vendorId)
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to approve vendor')
      }
      
      return {
        vendorId,
        data: response.data,
        message: response.message || 'Vendor approved successfully'
      }
    } catch (error) {
      console.error('❌ Error approving vendor:', error)
      return rejectWithValue(error.message || 'Failed to approve vendor')
    }
  }
)

export const rejectVendor = createAsyncThunk(
  'vendors/rejectVendor',
  async ({ vendorId, rejectionReason }, { rejectWithValue }) => {
    try {
      console.log('❌ Rejecting vendor:', vendorId)
      const response = await vendorService.rejectVendor(vendorId, rejectionReason)
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to reject vendor')
      }
      
      return {
        vendorId,
        rejectionReason,
        data: response.data,
        message: response.message || 'Vendor rejected successfully'
      }
    } catch (error) {
      console.error('❌ Error rejecting vendor:', error)
      return rejectWithValue(error.message || 'Failed to reject vendor')
    }
  }
)

export const suspendVendor = createAsyncThunk(
  'vendors/suspendVendor',
  async ({ vendorId, reason }, { rejectWithValue }) => {
    try {
      console.log('⚠️ Suspending vendor:', vendorId)
      const response = await vendorService.suspendVendor(vendorId, reason)
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to suspend vendor')
      }
      
      return {
        vendorId,
        reason,
        data: response.data,
        message: response.message || 'Vendor suspended successfully'
      }
    } catch (error) {
      console.error('❌ Error suspending vendor:', error)
      return rejectWithValue(error.message || 'Failed to suspend vendor')
    }
  }
)

export const reactivateVendor = createAsyncThunk(
  'vendors/reactivateVendor',
  async (vendorId, { rejectWithValue }) => {
    try {
      console.log('🔄 Reactivating vendor:', vendorId)
      const response = await vendorService.reactivateVendor(vendorId)
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to reactivate vendor')
      }
      
      return {
        vendorId,
        data: response.data,
        message: response.message || 'Vendor reactivated successfully'
      }
    } catch (error) {
      console.error('❌ Error reactivating vendor:', error)
      return rejectWithValue(error.message || 'Failed to reactivate vendor')
    }
  }
)

export const fetchVendorStats = createAsyncThunk(
  'vendors/fetchVendorStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching vendor stats')
      const response = await vendorService.getVendorStats()
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to fetch vendor stats')
      }
      
      return {
        stats: response.data || response,
        message: response.message || 'Vendor stats fetched successfully'
      }
    } catch (error) {
      console.error('❌ Error fetching vendor stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch vendor stats')
    }
  }
)

export const fetchDashboardStats = createAsyncThunk(
  'vendors/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching dashboard stats')
      const response = await vendorService.getDashboardStats()
      
      if (response.success === false) {
        return rejectWithValue(response.message || 'Failed to fetch dashboard stats')
      }
      
      return {
        stats: response.data || response,
        message: response.message || 'Dashboard stats fetched successfully'
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats')
    }
  }
)

// vendorSlice.js
export const downloadAllDocuments = createAsyncThunk(
  'vendors/downloadAllDocuments',
  async (vendorId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/vendors/${vendorId}/documents/download`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error('Failed to download documents')
      }

      const data = await res.json()
      return data // { url: "zip-file-url" }
    } catch (error) {
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
  success: null,
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
  },
  dashboardStats: {},
  lastUpdated: null
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
    clearSuccess: (state) => {
      state.success = null
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null
    },
    updateVendorInList: (state, action) => {
      const { vendorId, updates } = action.payload
      const index = state.vendors.findIndex(v => v._id === vendorId)
      if (index !== -1) {
        state.vendors[index] = { ...state.vendors[index], ...updates }
      }
    },
    removeVendorFromList: (state, action) => {
      state.vendors = state.vendors.filter(v => v._id !== action.payload)
    },
    resetVendors: (state) => {
      state.vendors = []
      state.selectedVendor = null
      state.pagination = initialState.pagination
      state.error = null
      state.success = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false
        state.vendors = action.payload.vendors
        state.pagination = action.payload.pagination
        state.lastUpdated = new Date().toISOString()
        state.success = action.payload.message
        console.log(`✅ State updated with ${state.vendors.length} vendors`)
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.vendors = []
        state.pagination = initialState.pagination
      })
      
      // Fetch Pending Vendors
      .addCase(fetchPendingVendors.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(fetchPendingVendors.fulfilled, (state, action) => {
        state.isLoading = false
        state.vendors = action.payload.vendors
        state.pagination = action.payload.pagination
        state.lastUpdated = new Date().toISOString()
        state.success = action.payload.message
        console.log(`✅ State updated with ${state.vendors.length} pending vendors`)
      })
      .addCase(fetchPendingVendors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.vendors = []
        state.pagination = initialState.pagination
      })
      
      // Fetch Vendor Details
      .addCase(fetchVendorDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(fetchVendorDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedVendor = action.payload.vendor
        state.success = action.payload.message
      })
      .addCase(fetchVendorDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.selectedVendor = null
      })
      
      // Approve Vendor
      .addCase(approveVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
        
        // Update vendor in list
        const index = state.vendors.findIndex(v => v._id === action.payload.vendorId)
        if (index !== -1) {
          state.vendors[index] = {
            ...state.vendors[index],
            status: 'approved',
            approvedAt: new Date().toISOString()
          }
        }
        
        // Update selected vendor if it's the same
        if (state.selectedVendor && state.selectedVendor._id === action.payload.vendorId) {
          state.selectedVendor.status = 'approved'
          state.selectedVendor.approvedAt = new Date().toISOString()
        }
        
        // Update stats
        state.stats.approved += 1
        state.stats.pending = Math.max(0, state.stats.pending - 1)
      })
      .addCase(approveVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reject Vendor
      .addCase(rejectVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
        
        // Remove vendor from pending list (optional)
        state.vendors = state.vendors.filter(v => v._id !== action.payload.vendorId)
        
        // Clear selected vendor if it's the same
        if (state.selectedVendor && state.selectedVendor._id === action.payload.vendorId) {
          state.selectedVendor = null
        }
        
        // Update stats
        state.stats.rejected += 1
        state.stats.pending = Math.max(0, state.stats.pending - 1)
      })
      .addCase(rejectVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Suspend Vendor
      .addCase(suspendVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(suspendVendor.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
        
        // Update vendor status
        const index = state.vendors.findIndex(v => v._id === action.payload.vendorId)
        if (index !== -1) {
          state.vendors[index] = {
            ...state.vendors[index],
            status: 'suspended',
            suspensionReason: action.payload.reason,
            suspendedAt: new Date().toISOString()
          }
        }
        
        // Update selected vendor
        if (state.selectedVendor && state.selectedVendor._id === action.payload.vendorId) {
          state.selectedVendor.status = 'suspended'
          state.selectedVendor.suspensionReason = action.payload.reason
          state.selectedVendor.suspendedAt = new Date().toISOString()
        }
        
        // Update stats
        state.stats.suspended += 1
        // If vendor was approved, decrement approved count
        if (state.selectedVendor?.status === 'approved') {
          state.stats.approved = Math.max(0, state.stats.approved - 1)
        }
      })
      .addCase(suspendVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reactivate Vendor
      .addCase(reactivateVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(reactivateVendor.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = action.payload.message
        
        // Update vendor status
        const index = state.vendors.findIndex(v => v._id === action.payload.vendorId)
        if (index !== -1) {
          state.vendors[index] = {
            ...state.vendors[index],
            status: 'approved',
            suspensionReason: null,
            suspendedAt: null
          }
        }
        
        // Update selected vendor
        if (state.selectedVendor && state.selectedVendor._id === action.payload.vendorId) {
          state.selectedVendor.status = 'approved'
          state.selectedVendor.suspensionReason = null
          state.selectedVendor.suspendedAt = null
        }
        
        // Update stats
        state.stats.approved += 1
        state.stats.suspended = Math.max(0, state.stats.suspended - 1)
      })
      .addCase(reactivateVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Vendor Stats
      .addCase(fetchVendorStats.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchVendorStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = {
          ...state.stats,
          ...action.payload.stats
        }
      })
      .addCase(fetchVendorStats.rejected, (state) => {
        state.isLoading = false
      })
      
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboardStats = action.payload.stats
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.isLoading = false
      })
  }
})

export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  clearSuccess,
  clearSelectedVendor,
  updateVendorInList,
  removeVendorFromList,
  resetVendors
} = vendorSlice.actions

export default vendorSlice.reducer