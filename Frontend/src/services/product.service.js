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
};