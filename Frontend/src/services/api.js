const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)
      
      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text/')) {
        data = await response.text()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || data || `HTTP error! status: ${response.status}`,
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
      // Don't set Content-Type for FormData, browser will set it with boundary
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status
      )
    }

    return data
  }
}