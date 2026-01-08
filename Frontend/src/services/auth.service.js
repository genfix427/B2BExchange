import { api } from './api'
import { ApiError } from './api' // Import ApiError

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/vendor/login', { email, password })
      
      if (response.success) {
        // Store vendor-specific info
        localStorage.setItem('userType', 'vendor')
        localStorage.setItem('lastLogin', new Date().toISOString())
        
        // Store vendor status for quick access
        if (response.data.status) {
          localStorage.setItem('vendorStatus', response.data.status)
        }
        
        // Store user data in session storage
        sessionStorage.setItem('userData', JSON.stringify(response.data))
        return response.data
      } else {
        throw new ApiError(response.message || 'Login failed', 400)
      }
      
    } catch (error) {
      // Handle 403 errors (account not approved)
      if (error.statusCode === 403 && error.data) {
        // Store the status info for redirect
        const statusData = error.data.data || error.data
        if (statusData) {
          localStorage.setItem('vendorStatusInfo', JSON.stringify(statusData))
        }
        
        // Re-throw with better message
        throw new ApiError(
          error.message,
          error.statusCode,
          statusData
        )
      }
      throw error
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      this.clearStorage()
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      
      if (response.success) {
        const userData = response.data
        
        // Check if user is a vendor
        if (userData.role === 'vendor') {
          // Update session storage
          sessionStorage.setItem('userData', JSON.stringify(userData))
          
          // Update vendor status
          localStorage.setItem('vendorStatus', userData.status)
          
          // Check for status change (auto logout)
          const previousStatus = localStorage.getItem('previousVendorStatus')
          if (previousStatus && previousStatus === 'approved' && 
              (userData.status === 'suspended' || userData.status === 'rejected')) {
            // Auto logout vendor
            this.clearStorage()
            throw new ApiError('Account status changed', 403, {
              status: userData.status,
              rejectionReason: userData.rejectionReason,
              suspensionReason: userData.suspensionReason
            })
          }
          
          // Store current status for next check
          localStorage.setItem('previousVendorStatus', userData.status)
          
          return userData
        } else {
          // Non-vendor user, clear storage
          this.clearStorage()
          throw new ApiError('Access denied. Vendor access only.', 403)
        }
      }
      throw new ApiError('Failed to get current user', 400)
    } catch (error) {
      // Clear storage on auth errors
      if (error.statusCode === 401 || error.statusCode === 403) {
        this.clearStorage()
      }
      throw error
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { 
        email, 
        userType: 'Vendor' 
      })
      return response
    } catch (error) {
      throw new ApiError(error.message, error.statusCode)
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { 
        password, 
        userType: 'Vendor' 
      })
      return response
    } catch (error) {
      throw new ApiError(error.message, error.statusCode)
    }
  },

  // Helper methods
  clearStorage() {
    localStorage.removeItem('userType')
    localStorage.removeItem('lastLogin')
    localStorage.removeItem('vendorStatus')
    localStorage.removeItem('previousVendorStatus')
    localStorage.removeItem('vendorStatusInfo')
    sessionStorage.removeItem('userData')
    // Clear cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;'
  },

  getStoredUser() {
    try {
      const userData = sessionStorage.getItem('userData')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  },

  getVendorStatus() {
    return localStorage.getItem('vendorStatus')
  },

  getStatusInfo() {
    try {
      const statusInfo = localStorage.getItem('vendorStatusInfo')
      return statusInfo ? JSON.parse(statusInfo) : null
    } catch (error) {
      return null
    }
  },

  clearStatusInfo() {
    localStorage.removeItem('vendorStatusInfo')
  },

  isAuthenticated() {
    const userData = this.getStoredUser()
    return !!userData && userData.role === 'vendor'
  },

  isVendorApproved() {
    const status = this.getVendorStatus()
    return status === 'approved'
  },

  // Check if vendor needs to complete profile
  isProfileComplete() {
    const userData = this.getStoredUser()
    return userData?.profileCompleted || false
  }
}