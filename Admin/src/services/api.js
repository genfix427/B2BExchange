// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL

export class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    this.name = 'ApiError'
  }
}

const getAuthToken = () => {
  // Try to get from cookie first
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {})
  
  return cookies.admin_token || null
}

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Add auth token if available
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const config = {
      ...options,
      credentials: 'include', // Include cookies
      headers
    }

    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      endpoint,
      hasAuthToken: !!token
    })

    try {
      const response = await fetch(url, config)
      
      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          data
        })
        
        // Handle specific status codes
        if (response.status === 401) {
          // Clear local storage on unauthorized
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          localStorage.removeItem('adminPermissions')
        }
        
        throw new ApiError(
          data?.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        )
      }

      console.log('✅ API Success:', {
        url,
        success: data?.success,
        hasData: !!data?.data || !!data
      })

      return data
    } catch (error) {
      console.error('💥 API Request Error:', {
        endpoint,
        error: error.message,
        statusCode: error.statusCode
      })
      
      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle network errors
      throw new ApiError(
        error.message || 'Network error occurred',
        0,
        null
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
  },

  // Helper method for file uploads
  upload(endpoint, formData, options = {}) {
    const headers = {
      ...options.headers
    }
    
    // Remove Content-Type for multipart/form-data
    delete headers['Content-Type']
    
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers
    })
  }
}