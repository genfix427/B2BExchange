import { api } from './api'

export const adminAuthService = {
  async login(email, password) {
    const response = await api.post('/admin/auth/login', { email, password })
    
    if (response.success) {
      // Store admin info in localStorage
      localStorage.setItem('adminToken', 'true')
      localStorage.setItem('adminUser', JSON.stringify(response.data))
      localStorage.setItem('adminLastLogin', new Date().toISOString())
      localStorage.setItem('adminPermissions', JSON.stringify(response.data.permissions || {}))
    }
    
    return response.data
  },

  async logout() {
    try {
      await api.post('/admin/auth/logout')
    } catch (error) {
      console.error('Admin logout API error:', error)
    } finally {
      this.clearAdminStorage()
    }
  },

  async getCurrentAdmin() {
    try {
      const response = await api.get('/admin/auth/me')
      
      if (response.success) {
        // Update localStorage
        localStorage.setItem('adminUser', JSON.stringify(response.data))
        localStorage.setItem('adminPermissions', JSON.stringify(response.data.permissions || {}))
        return response.data
      }
      throw new Error('Failed to get current admin')
    } catch (error) {
      // If unauthorized, clear storage
      if (error.statusCode === 401) {
        this.clearAdminStorage()
      }
      throw error
    }
  },

  async forgotPassword(email) {
    const response = await api.post('/admin/auth/forgot-password', { email })
    return response
  },

  async resetPassword(token, password) {
    const response = await api.post(`/admin/auth/reset-password/${token}`, { password })
    return response
  },

  // Helper methods
  clearAdminStorage() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminLastLogin')
    localStorage.removeItem('adminPermissions')
    // Clear admin cookies
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  },

  getStoredAdmin() {
    try {
      const adminData = localStorage.getItem('adminUser')
      return adminData ? JSON.parse(adminData) : null
    } catch (error) {
      console.error('Error parsing stored admin data:', error)
      return null
    }
  },

  isAdminAuthenticated() {
    const adminData = this.getStoredAdmin()
    return !!adminData && !!localStorage.getItem('adminToken')
  },

  getAdminPermissions() {
    try {
      const permissions = localStorage.getItem('adminPermissions')
      return permissions ? JSON.parse(permissions) : {}
    } catch (error) {
      return {}
    }
  },

  hasPermission(permission) {
    const permissions = this.getAdminPermissions()
    return permissions[permission] === true
  }
}