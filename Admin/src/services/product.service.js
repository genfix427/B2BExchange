import { api } from './api';

export const productService = {

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