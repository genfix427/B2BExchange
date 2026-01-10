// src/services/api.js - UPDATED to work with vendor auth
const API_BASE_URL =
  import.meta.env.VITE_VENDOR_API_BASE_URL || 'http://localhost:5000/api'

// ✅ Get token from vendor storage
const getToken = () => {
  if (typeof window !== 'undefined') {
    // First check for vendor data
    const vendorUser = localStorage.getItem('vendorUser')
    if (vendorUser) {
      try {
        const vendorData = JSON.parse(vendorUser)
        return vendorData.token // Your backend might send token in response.data
      } catch (error) {
        console.error('Error parsing vendorUser:', error)
      }
    }
    // Fallback to regular token
    return localStorage.getItem('token')
  }
  return null
}

// ✅ Get vendor ID from storage
const getVendorId = () => {
  if (typeof window !== 'undefined') {
    const vendorUser = localStorage.getItem('vendorUser')
    if (vendorUser) {
      try {
        const vendorData = JSON.parse(vendorUser)
        return vendorData._id || vendorData.id
      } catch (error) {
        console.error('Error parsing vendorUser:', error)
      }
    }
    return localStorage.getItem('vendorId')
  }
  return null
}

// ✅ Get full vendor data
const getVendorData = () => {
  if (typeof window !== 'undefined') {
    const vendorUser = localStorage.getItem('vendorUser')
    if (vendorUser) {
      try {
        return JSON.parse(vendorUser)
      } catch (error) {
        console.error('Error parsing vendorUser:', error)
      }
    }
  }
  return null
}

export class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.data = data
  }
}

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    // ✅ Get vendor token
    const token = getToken()
    const vendorData = getVendorData()

    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Type': 'vendor',
        ...options.headers
      }
    }

    // ✅ Add Authorization header if token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // ✅ Log for debugging (remove in production)
    console.log('🌐 API Request:', {
      url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      vendorId: vendorData?._id || 'No vendor ID'
    })

    try {
      const response = await fetch(url, config)

      const contentType = response.headers.get('content-type')
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text()

      if (!response.ok) {
        throw new ApiError(
          data?.message || `HTTP error ${response.status}`,
          response.status,
          data
        )
      }

      return data
    } catch (error) {
      console.error('🌐 API Request Error:', error)
      if (error instanceof ApiError) throw error
      throw new ApiError(error.message || 'Network error', 0)
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

  async upload(endpoint, formData, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const token = getToken()
    const config = {
      ...options,
      method: options.method || 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-User-Type': 'vendor',
        ...options.headers
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data?.message || `HTTP error ${response.status}`,
        response.status,
        data
      )
    }

    return data
  }
}

// ✅ Export helper functions
export { getToken, getVendorId, getVendorData }