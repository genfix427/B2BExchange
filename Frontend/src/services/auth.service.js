import { api } from './api'



export const authService = {
  async login(email, password) {
    const response = await api.post('/vendor/auth/login', { email, password })
    
    if (response.success) {
      // Store vendor info
      localStorage.setItem('vendorToken', 'true')
      localStorage.setItem('vendorUser', JSON.stringify(response.data))
      localStorage.setItem('vendorLastLogin', new Date().toISOString())
      localStorage.setItem('vendorStatus', response.data.status)
    }
    
    return response.data
  },

  async logout() {
    try {
      await api.post('/vendor/auth/logout')
    } catch (error) {
      console.error('Vendor logout API error:', error)
    } finally {
      this.clearVendorStorage()
    }
  },

  async getCurrentVendor() {
    try {
      const response = await api.get('/vendor/auth/me')
      
      if (response.success) {
        const vendorData = response.data
        
        // Update localStorage
        localStorage.setItem('vendorUser', JSON.stringify(vendorData))
        localStorage.setItem('vendorStatus', vendorData.status)
        
        return vendorData
      }
      throw new Error('Failed to get current vendor')
    } catch (error) {
      // If unauthorized or status changed, clear storage
      if (error.statusCode === 401 || error.statusCode === 403) {
        this.clearVendorStorage()
      }
      throw error
    }
  },

  async forgotPassword(email) {
    const response = await api.post('/vendor/auth/forgot-password', { email })
    return response
  },

  async resetPassword(token, password) {
    const response = await api.post(`/vendor/auth/reset-password/${token}`, { password })
    return response
  },

  async updateProfile(profileData) {
    const response = await api.put('/vendor/auth/profile', profileData)
    return response
  },

  // Helper methods
  clearVendorStorage() {
    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendorUser')
    localStorage.removeItem('vendorLastLogin')
    localStorage.removeItem('vendorStatus')
    // Clear vendor cookies
    document.cookie = 'vendor_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  },

  getStoredVendor() {
    try {
      const vendorData = localStorage.getItem('vendorUser')
      return vendorData ? JSON.parse(vendorData) : null
    } catch (error) {
      console.error('Error parsing stored vendor data:', error)
      return null
    }
  },

  isVendorAuthenticated() {
    const vendorData = this.getStoredVendor()
    const hasToken = !!localStorage.getItem('vendorToken')
    return !!vendorData && hasToken
  },

  getVendorStatus() {
    return localStorage.getItem('vendorStatus')
  },

  isVendorApproved() {
    const status = this.getVendorStatus()
    return status === 'approved'
  },

  isProfileComplete() {
    const vendor = this.getStoredVendor()
    return vendor?.profileCompleted || false
  }
}