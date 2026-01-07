import { api } from './api'

export const authService = {
  async login(email, password, userType = 'vendor') {
    const endpoint = userType === 'admin' ? '/auth/admin/login' : '/auth/vendor/login'
    const response = await api.post(endpoint, { email, password })
    
    // Store minimal info in localStorage
    if (response.success) {
      localStorage.setItem('userType', userType)
      localStorage.setItem('lastLogin', new Date().toISOString())
      // Store user data in session storage for quick access
      sessionStorage.setItem('userData', JSON.stringify(response.data))
    }
    
    return response.data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with cleanup even if API fails
    } finally {
      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()
      // Clear cookies by setting expired date
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      
      if (response.success) {
        // Update session storage
        sessionStorage.setItem('userData', JSON.stringify(response.data))
        return response.data
      }
      throw new Error('Failed to get current user')
    } catch (error) {
      // If unauthorized, clear storage
      if (error.statusCode === 401) {
        this.clearStorage()
      }
      throw error
    }
  },

  async forgotPassword(email, userType = 'Vendor') {
    const response = await api.post('/auth/forgot-password', { email, userType })
    return response
  },

  async resetPassword(token, password, userType = 'Vendor') {
    const response = await api.post(`/auth/reset-password/${token}`, { password, userType })
    return response
  },

  // Helper methods
  clearStorage() {
    localStorage.clear()
    sessionStorage.clear()
  },

  // Add this function
  getStoredUser() {
    try {
      const userData = sessionStorage.getItem('userData')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  },

  // Add this function
  isAuthenticated() {
    const userData = this.getStoredUser()
    return !!userData
  },

  getUserType() {
    return localStorage.getItem('userType')
  }
}