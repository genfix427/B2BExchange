import { api } from './api'
import { cookieHelper } from '../utils/cookieHelper'

export const authService = {
  async login(email, password) {
    try {
      console.log('Attempting admin login...')
      
      // Clear any existing cookies first
      cookieHelper.clearAllAuthCookies()
      
      const response = await api.post('/admin/auth/login', { email, password })
      
      console.log('Admin login response:', {
        success: response.success,
        cookies: document.cookie
      })
      
      if (response.success) {
        // Store admin info in localStorage
        localStorage.setItem('adminToken', 'true')
        localStorage.setItem('adminUser', JSON.stringify(response.data))
        localStorage.setItem('adminLastLogin', new Date().toISOString())
        localStorage.setItem('adminPermissions', JSON.stringify(response.data.permissions || {}))
        
        // Check if cookie was set
        if (!cookieHelper.hasAdminToken()) {
          console.warn('Admin token cookie not set after login')
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Admin login error:', error)
      throw error
    }
  },

  async logout() {
    try {
      console.log('Attempting admin logout...')
      await api.post('/admin/auth/logout')
      console.log('Admin logout successful')
    } catch (error) {
      console.error('Admin logout API error:', error)
    } finally {
      this.clearAdminStorage()
    }
  },

  async getCurrentAdmin() {
    try {
      console.log('Getting current admin, cookies:', document.cookie)
      
      // Check if we have an admin token cookie
      if (!cookieHelper.hasAdminToken()) {
        console.log('No admin_token cookie found, clearing storage')
        this.clearAdminStorage()
        throw new Error('No authentication token found')
      }

      const response = await api.get('/admin/auth/me')
      
      console.log('Get current admin response:', {
        success: response.success,
        hasData: !!response.data,
        cookies: document.cookie
      })

      if (response.success) {
        // Update localStorage
        localStorage.setItem('adminUser', JSON.stringify(response.data))
        localStorage.setItem('adminPermissions', JSON.stringify(response.data.permissions || {}))
        return response.data
      }
      throw new Error('Failed to get current admin')
    } catch (error) {
      console.error('Get current admin error:', {
        statusCode: error.statusCode,
        message: error.message,
        cookies: document.cookie
      })
      
      // If unauthorized, clear storage
      if (error.statusCode === 401 || error.message.includes('No authentication')) {
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
    console.log('Clearing admin storage...')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminLastLogin')
    localStorage.removeItem('adminPermissions')
    // Clear admin cookies
    cookieHelper.clearAdminToken()
    console.log('Admin storage cleared')
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
    // Check both localStorage and cookies
    const adminData = this.getStoredAdmin()
    const hasLocalToken = !!localStorage.getItem('adminToken')
    const hasCookieToken = cookieHelper.hasAdminToken()
    
    console.log('Auth check:', {
      hasAdminData: !!adminData,
      hasLocalToken,
      hasCookieToken
    })
    
    return !!adminData && hasLocalToken && hasCookieToken
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
  },

  // Check if we have valid cookies
  checkCookies() {
    return {
      hasAdminToken: cookieHelper.hasAdminToken(),
      adminToken: cookieHelper.getAdminToken(),
      allCookies: document.cookie
    }
  }
}