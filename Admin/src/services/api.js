const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get token from multiple possible locations
    const token = localStorage.getItem('adminToken') || 
                  localStorage.getItem('token')
    
    console.log(`API Request to: ${url}`) // Debug
    console.log(`Token exists: ${!!token}`) // Debug
    console.log(`Token value: ${token ? `${token.substring(0, 20)}...` : 'none'}`) // Debug
    
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    }

    console.log('Request headers:', config.headers) // Debug

    try {
      const response = await fetch(url, config)
      
      console.log(`Response status: ${response.status} ${response.statusText}`) // Debug
      
      // Handle specific status codes
      if (response.status === 401) {
        console.error('Unauthorized - token invalid or expired')
        // Clear invalid token
        localStorage.removeItem('adminToken')
        localStorage.removeItem('token')
        localStorage.removeItem('adminUserType')
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login'
        }
      }
      
      if (response.status === 403) {
        console.error('Forbidden - insufficient permissions')
      }
      
      const contentType = response.headers.get('content-type')
      const data = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text()

      console.log('Response data:', data) // Debug

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status
        )
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error) // Debug
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error.message || 'Network error occurred',
        0
      )
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}