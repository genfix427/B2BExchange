// src/services/api.js

// REQUIRED ENV (Render):
// VITE_API_BASE_URL=https://b2bexchange-backend.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('🌍 VENDOR API_BASE_URL:', API_BASE_URL);

export class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const api = {
  async request(endpoint, options = {}) {
    if (!API_BASE_URL) {
      throw new ApiError('API base URL is not defined', 500);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      ...(options.headers || {})
    };

    // ✅ Only set JSON header if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method: options.method || 'GET',
      headers,
      body: options.body,
      credentials: 'include' // 🔥 SEND VENDOR COOKIE
    };

    console.log('🌐 Vendor API Request:', {
      url,
      method: config.method,
      endpoint
    });

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      // In your api.js - update the error handling in the request method
      if (!response.ok) {
        console.error('❌ Vendor API Error:', {
          status: response.status,
          data
        });

        // Auto-handle auth failure
        if (response.status === 401) {
          localStorage.removeItem('vendorUser');
        }

        // Create error with status information from response
        const errorMessage = data?.message || 'Request failed';
        const apiError = new ApiError(errorMessage, response.status, data);

        // Add status info if available in response data
        if (data?.data?.status) {
          apiError.status = data.data.status;
          apiError.rejectionReason = data.data.rejectionReason;
          apiError.suspensionReason = data.data.suspensionReason;
        } else if (data?.status) {
          // Sometimes status might be at the root level
          apiError.status = data.status;
          apiError.rejectionReason = data.rejectionReason;
          apiError.suspensionReason = data.suspensionReason;
        }

        throw apiError;
      }

      return data;
    } catch (error) {
      console.error('💥 Vendor API Request Error:', {
        endpoint,
        message: error.message
      });

      if (error instanceof ApiError) throw error;

      throw new ApiError(error.message || 'Network error', 0);
    }
  },

  // ------------------------
  // HTTP METHODS
  // ------------------------

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  },

  // ------------------------
  // FILE UPLOAD
  // ------------------------

  upload(endpoint, formData, options = {}) {
    const headers = {
      ...(options.headers || {})
    };

    // IMPORTANT: do NOT set Content-Type manually
    delete headers['Content-Type'];

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers
    });
  }
};
