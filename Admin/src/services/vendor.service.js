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
      console.log('getVendors API response:', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length,
        dataIsArray: Array.isArray(response.data),
        pagination: response.pagination
      })
      
      // Return the full response
      return response
    } catch (error) {
      console.error('Error in getVendors:', error)
      throw error
    }
  },

  async getVendorDetails(vendorId) {
    console.log('Fetching vendor details for:', vendorId)
    try {
      const response = await api.get(`/admin/vendors/${vendorId}`)
      console.log('getVendorDetails response:', response)
      return response
    } catch (error) {
      console.error('Error in getVendorDetails:', error)
      throw error
    }
  },

  async getPendingVendors(page = 1, limit = 10) {
    const endpoint = `/admin/vendors/pending?page=${page}&limit=${limit}`
    console.log('Fetching pending vendors from:', endpoint)
    
    try {
      const response = await api.get(endpoint)
      console.log('getPendingVendors API response:', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length,
        dataIsArray: Array.isArray(response.data),
        pagination: response.pagination
      })
      
      // Return the full response
      return response
    } catch (error) {
      console.error('Error in getPendingVendors:', error)
      throw error
    }
  },

  async approveVendor(vendorId) {
    console.log('Approving vendor:', vendorId)
    try {
      const response = await api.put(`/admin/vendors/${vendorId}/approve`)
      console.log('approveVendor response:', response)
      return response
    } catch (error) {
      console.error('Error in approveVendor:', error)
      throw error
    }
  },

  // async rejectVendor(vendorId, rejectionReason) {
  //   console.log('Rejecting vendor:', vendorId, 'with reason:', rejectionReason)
  //   try {
  //     const response = await api.put(`/admin/vendors/${vendorId}/reject`, { rejectionReason })
  //     console.log('rejectVendor response:', response)
  //     return response
  //   } catch (error) {
  //     console.error('Error in rejectVendor:', error)
  //     throw error
  //   }
  // },

  // async suspendVendor(vendorId, reason) {
  //   console.log('Suspending vendor:', vendorId, 'with reason:', reason)
  //   try {
  //     const response = await api.put(`/admin/vendors/${vendorId}/suspend`, { reason })
  //     console.log('suspendVendor response:', response)
  //     return response
  //   } catch (error) {
  //     console.error('Error in suspendVendor:', error)
  //     throw error
  //   }
  // },

  async suspendVendor(vendorId, reason) {
    const response = await api.put(`/admin/vendors/${vendorId}/suspend`, { reason })
    return response
  },

  async rejectVendor(vendorId, rejectionReason) {
    const response = await api.put(`/admin/vendors/${vendorId}/reject`, { rejectionReason })
    return response
  },

  async reactivateVendor(vendorId) {
    const response = await api.put(`/admin/vendors/${vendorId}/reactivate`)
    return response
  },

  async getVendorStats() {
    console.log('Fetching vendor stats')
    try {
      const response = await api.get('/admin/stats/vendors')
      console.log('getVendorStats response:', response)
      return response
    } catch (error) {
      console.error('Error in getVendorStats:', error)
      throw error
    }
  }
}