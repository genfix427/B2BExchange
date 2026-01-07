import { api } from './api'

export const authService = {
  async login(email, password) {
    try {
      console.log('Attempting login for:', email) // Debug
      
      const response = await api.post('/auth/admin/login', { email, password })
      
      console.log('Login response:', response) // Debug
      
      if (response.success && response.data) {
        // Store token from response
        const token = response.data.token || response.data.accessToken
        
        if (token) {
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminUserType', 'admin')
          localStorage.setItem('adminEmail', email)
          
          // Store user data if available
          if (response.data.user) {
            localStorage.setItem('adminUser', JSON.stringify(response.data.user))
          }
          
          console.log('Login successful, token stored') // Debug
        } else {
          console.warn('No token in response') // Debug
        }
      } else {
        console.warn('Login response not successful:', response) // Debug
      }
      
      return response.data
    } catch (error) {
      console.error('Login error:', error) // Debug
      throw error
    }
  },

  async logout() {
    try {
      // Clear all admin-related storage first
      localStorage.removeItem('adminToken')
      localStorage.removeItem('token')
      localStorage.removeItem('adminUserType')
      localStorage.removeItem('adminEmail')
      localStorage.removeItem('adminUser')
      
      console.log('LocalStorage cleared') // Debug
      
      // Then call logout API
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      console.log('Current user response:', response) // Debug
      return response.data
    } catch (error) {
      console.error('Get current user error:', error) // Debug
      throw error
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem('adminToken')
    const isValid = !!token
    console.log('Auth check - Token valid:', isValid) // Debug
    return isValid
  },

  getToken() {
    return localStorage.getItem('adminToken')
  },

  async logout() {
    await api.post('/auth/logout')
    localStorage.clear()
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email, userType: 'Admin' })
    return response
  },

  async resetPassword(token, password) {
    const response = await api.post(`/auth/reset-password/${token}`, { 
      password, 
      userType: 'Admin' 
    })
    return response
  },

  isAuthenticated() {
    return !!localStorage.getItem('adminUserType')
  },

  getUserType() {
    return localStorage.getItem('adminUserType')
  }
}