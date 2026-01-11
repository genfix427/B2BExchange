// src/services/api.js

// IMPORTANT:
// Make sure this env exists in Render:
// VITE_API_BASE_URL=https://b2bexchange-backend.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('🌍 API_BASE_URL:', API_BASE_URL);

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
      throw new ApiError(
        'API base URL is not defined',
        500
      );
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const config = {
      method: options.method || 'GET',
      headers,
      body: options.body,
      credentials: 'include' // 🔥 REQUIRED FOR COOKIE AUTH
    };

    console.log('🌐 API Request:', {
      url,
      method: config.method,
      endpoint
    });

    try {
      const response = await fetch(url, config);

      console.log('📡 API Response:', {
        url,
        status: response.status,
        ok: response.ok
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          data
        });

        // Handle unauthorized globally
        if (response.status === 401) {
          // Clear any cached admin data
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminPermissions');
        }

        throw new ApiError(
          data?.message || 'Request failed',
          response.status,
          data
        );
      }

      console.log('✅ API Success:', {
        endpoint,
        hasData: !!data
      });

      return data;
    } catch (error) {
      console.error('💥 API Request Error:', {
        endpoint,
        message: error.message,
        statusCode: error.statusCode
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error.message || 'Network error',
        0,
        null
      );
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

    // IMPORTANT: Do NOT set Content-Type manually for FormData
    delete headers['Content-Type'];

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers
    });
  }
};
