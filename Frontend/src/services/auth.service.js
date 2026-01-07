import { api } from './api'

export const authService = {
  async login(email, password, userType = 'vendor') {
    const endpoint = userType === 'admin' ? '/auth/admin/login' : '/auth/vendor/login'
    const response = await api.post(endpoint, { email, password })
    
    if (response.success) {
      // Store user info in localStorage for quick access (excluding sensitive data)
      localStorage.setItem('userType', userType)
      localStorage.setItem('userEmail', email)
    }
    
    return response.data
  },

  async logout() {
    await api.post('/auth/logout')
    localStorage.clear()
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async forgotPassword(email, userType = 'Vendor') {
    const response = await api.post('/auth/forgot-password', { email, userType })
    return response
  },

  async resetPassword(token, password, userType = 'Vendor') {
    const response = await api.post(`/auth/reset-password/${token}`, { password, userType })
    return response
  },

  // Helper to check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('userType')
  },

  // Get stored user type
  getUserType() {
    return localStorage.getItem('userType')
  }
}