// src/services/vendor.service.js
import { api } from './api'

export const vendorService = {
  async getVendors(filters = {}) {
    const queryParams = new URLSearchParams()
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status)
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search)
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page)
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit)
    }
    
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/admin/vendors?${queryString}` : '/admin/vendors'
    
    console.log('Fetching vendors from:', endpoint)
    
    try {
      const response = await api.get(endpoint)
      console.log('getVendors API response:', response)
      
      // Handle different response structures
      if (response && response.success !== undefined) {
        // Standard response: { success, data, message, pagination? }
        return response
      } else if (Array.isArray(response)) {
        // Array response: []
        return {
          success: true,
          data: response,
          message: 'Vendors fetched successfully'
        }
      } else if (response && typeof response === 'object') {
        // Object response: { data: [], pagination: {} }
        return {
          success: true,
          ...response
        }
      } else {
        return {
          success: false,
          data: [],
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in getVendors:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch vendors',
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: 0,
          pages: 1
        }
      }
    }
  },

  async getVendorDetails(vendorId) {
    console.log('Fetching vendor details for:', vendorId)
    try {
      const response = await api.get(`/admin/vendors/${vendorId}`)
      console.log('getVendorDetails response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Vendor details fetched successfully'
        }
      } else {
        return {
          success: false,
          data: null,
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in getVendorDetails:', error)
      return {
        success: false,
        message: error.message || 'Failed to fetch vendor details',
        data: null
      }
    }
  },

  async getPendingVendors(page = 1, limit = 10) {
    const endpoint = `/admin/vendors/pending?page=${page}&limit=${limit}`
    console.log('Fetching pending vendors from:', endpoint)
    
    try {
      const response = await api.get(endpoint)
      console.log('getPendingVendors API response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
          message: 'Pending vendors fetched successfully',
          pagination: {
            page,
            limit,
            total: response.length,
            pages: Math.ceil(response.length / limit)
          }
        }
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          ...response
        }
      } else {
        return {
          success: false,
          data: [],
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in getPendingVendors:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch pending vendors',
        pagination: {
          page,
          limit,
          total: 0,
          pages: 1
        }
      }
    }
  },

  async approveVendor(vendorId) {
    console.log('Approving vendor:', vendorId)
    try {
      const response = await api.put(`/admin/vendors/${vendorId}/approve`)
      console.log('approveVendor response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Vendor approved successfully'
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in approveVendor:', error)
      return {
        success: false,
        message: error.message || 'Failed to approve vendor'
      }
    }
  },

  async rejectVendor(vendorId, rejectionReason) {
    console.log('Rejecting vendor:', vendorId, 'with reason:', rejectionReason)
    try {
      const response = await api.put(`/admin/vendors/${vendorId}/reject`, { rejectionReason })
      console.log('rejectVendor response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Vendor rejected successfully'
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in rejectVendor:', error)
      return {
        success: false,
        message: error.message || 'Failed to reject vendor'
      }
    }
  },

  async suspendVendor(vendorId, reason) {
    console.log('Suspending vendor:', vendorId, 'with reason:', reason)
    try {
      const response = await api.put(`/admin/vendors/${vendorId}/suspend`, { reason })
      console.log('suspendVendor response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Vendor suspended successfully'
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in suspendVendor:', error)
      return {
        success: false,
        message: error.message || 'Failed to suspend vendor'
      }
    }
  },

  async reactivateVendor(vendorId) {
    console.log('Reactivating vendor:', vendorId)
    try {
      const response = await api.put(`/admin/vendors/${vendorId}/reactivate`)
      console.log('reactivateVendor response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Vendor reactivated successfully'
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in reactivateVendor:', error)
      return {
        success: false,
        message: error.message || 'Failed to reactivate vendor'
      }
    }
  },

  async getVendorStats() {
    console.log('Fetching vendor stats')
    try {
      const response = await api.get('/admin/stats/vendors')
      console.log('getVendorStats response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Vendor stats fetched successfully'
        }
      } else {
        return {
          success: false,
          data: {},
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in getVendorStats:', error)
      return {
        success: false,
        data: {},
        message: error.message || 'Failed to fetch vendor stats'
      }
    }
  },

  async getDashboardStats() {
    console.log('Fetching dashboard stats')
    try {
      const response = await api.get('/admin/dashboard/stats')
      console.log('getDashboardStats response:', response)
      
      if (response && response.success !== undefined) {
        return response
      } else if (response && typeof response === 'object') {
        return {
          success: true,
          data: response,
          message: 'Dashboard stats fetched successfully'
        }
      } else {
        return {
          success: false,
          data: {},
          message: 'Invalid response format'
        }
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      return {
        success: false,
        data: {},
        message: error.message || 'Failed to fetch dashboard stats'
      }
    }
  },

  async refreshVendors(filters = {}) {
    try {
      return await this.getVendors(filters)
    } catch (error) {
      console.error('Error in refreshVendors:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to refresh vendors'
      }
    }
  }
}

// add at the bottom of vendor.service.js
// vendorService.getAllVendors = vendorService.getVendors
