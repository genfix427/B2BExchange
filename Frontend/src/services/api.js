const API_BASE_URL = import.meta.env.VITE_VENDOR_API_BASE_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    this.name = 'ApiError'
  }
}

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config = {
      ...options,
      credentials: 'include', // CRITICAL: Include cookies for vendor_token
      headers: {
        'Content-Type': 'application/json',
        'X-User-Type': 'vendor', // Specify user type
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      const data = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text()

      if (!response.ok) {
        // Handle vendor status errors
        if (response.status === 403 && data?.status) {
          throw new ApiError(
            data.message || `Account is ${data.status}`,
            response.status,
            data.data || data
          )
        }
        throw new ApiError(
          data?.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        )
      }

      return data
    } catch (error) {
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
  },

  // For file uploads
  async upload(endpoint, formData, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config = {
      ...options,
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-User-Type': 'vendor',
        ...options.headers
      }
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      )
    }

    return data
  }
}