import { api } from './api';

export const productService = {
  // Vendor product operations
  async createProduct(formData) {
    const response = await api.upload('/vendor/products', formData);
    return response.data;
  },

  async getVendorProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/vendor/products${query ? `?${query}` : ''}`);
    return response;
  },

  async getVendorProduct(id) {
    const response = await api.get(`/vendor/products/${id}`);
    return response.data;
  },

  async updateProduct(id, formData) {
    const response = await api.upload(`/vendor/products/${id}`, formData, {
      method: 'PUT'
    });
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/vendor/products/${id}`);
    return response.data;
  },

  async getProductStats() {
    const response = await api.get('/vendor/products/stats');
    return response;
  },

  // Admin product operations
  async getAllProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/products${query ? `?${query}` : ''}`);
    return response;
  },

  async getAdminProduct(id) {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  async updateProductAdmin(id, data) {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },

  async deleteProductAdmin(id) {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  async getAdminProductStats() {
    const response = await api.get('/admin/products/stats');
    return response;
  },

  // Public store operations
  async getStoreProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/products${query ? `?${query}` : ''}`);
    return response;
  },

  async getProductDetails(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async searchProducts(query) {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};