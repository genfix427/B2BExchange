// src/services/auth.service.js - UPDATED
import { api } from './api.js'

export const authService = {
  async login(email, password) {
    const response = await api.post('/vendor/auth/login', { email, password })
    
    console.log('🔐 Login response:', response) // Debug log
    
    if (response.success) {
      // ✅ Store token and vendor data properly
      const vendorData = response.data
      
      // Check if token is in vendorData or response root
      const token = vendorData.token || response.token
      
      if (token) {
        localStorage.setItem('token', token)
        console.log('✅ Token stored:', token.substring(0, 20) + '...')
      }
      
      // Store vendor info
      localStorage.setItem('vendorToken', 'true')
      localStorage.setItem('vendorUser', JSON.stringify(vendorData))
      localStorage.setItem('vendorId', vendorData._id || vendorData.id)
      localStorage.setItem('vendorLastLogin', new Date().toISOString())
      localStorage.setItem('vendorStatus', vendorData.status)
      
      console.log('✅ Vendor data stored:', {
        id: vendorData._id,
        name: vendorData.pharmacyInfo?.legalBusinessName,
        status: vendorData.status
      })
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
        
        // ✅ Update localStorage with token if provided
        if (vendorData.token) {
          localStorage.setItem('token', vendorData.token)
        }
        
        localStorage.setItem('vendorUser', JSON.stringify(vendorData))
        localStorage.setItem('vendorId', vendorData._id || vendorData.id)
        localStorage.setItem('vendorStatus', vendorData.status)
        
        return vendorData
      }
      throw new Error('Failed to get current vendor')
    } catch (error) {
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
    // Clear all auth-related storage
    localStorage.removeItem('token')
    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendorUser')
    localStorage.removeItem('vendorId')
    localStorage.removeItem('vendorLastLogin')
    localStorage.removeItem('vendorStatus')
    
    // Clear vendor cookies
    document.cookie = 'vendor_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    console.log('✅ Vendor storage cleared')
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
    // Check both vendor token and JWT token
    const vendorData = this.getStoredVendor()
    const hasVendorToken = !!localStorage.getItem('vendorToken')
    const hasJwtToken = !!localStorage.getItem('token')
    
    return !!vendorData && (hasVendorToken || hasJwtToken)
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
  },
  
  // ✅ New method: Get current token
  getToken() {
    const vendorData = this.getStoredVendor()
    if (vendorData?.token) {
      return vendorData.token
    }
    return localStorage.getItem('token')
  },
  
  // ✅ New method: Get vendor ID
  getVendorId() {
    const vendorData = this.getStoredVendor()
    if (vendorData?._id) {
      return vendorData._id
    }
    if (vendorData?.id) {
      return vendorData.id
    }
    return localStorage.getItem('vendorId')
  },
  
  // ✅ Debug method
  debugAuth() {
    console.log('🔍 Auth Debug:')
    console.log('vendorToken:', localStorage.getItem('vendorToken'))
    console.log('token:', localStorage.getItem('token'))
    console.log('vendorId:', localStorage.getItem('vendorId'))
    
    const vendorUser = localStorage.getItem('vendorUser')
    if (vendorUser) {
      try {
        const vendorData = JSON.parse(vendorUser)
        console.log('vendorUser:', {
          id: vendorData._id || vendorData.id,
          name: vendorData.pharmacyInfo?.legalBusinessName,
          hasToken: !!vendorData.token,
          status: vendorData.status
        })
      } catch (e) {
        console.error('Error parsing vendorUser:', e)
      }
    }
  }
}