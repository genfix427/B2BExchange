// src/services/product.service.js

import { api } from './api'

export const productService = {
  // ✅ CREATE PRODUCT
  async createProduct(formData) {
    const response = await api.upload('/vendor/products', formData)
    return response.data
  },

  // ✅ GET ALL VENDOR PRODUCTS
  async getVendorProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/vendor/products${query ? `?${query}` : ''}`)
  },

  // ✅ GET SINGLE PRODUCT
  async getVendorProduct(id) {
    const response = await api.get(`/vendor/products/${id}`)
    return response.data
  },

  // ✅ UPDATE PRODUCT (PUT FIXED)
  async updateProduct(id, formData) {
    const response = await api.upload(
      `/vendor/products/${id}`,
      formData,
      { method: 'PUT' } // ✅ WORKS NOW
    )
    return response.data
  },

  // ✅ DELETE PRODUCT
  async deleteProduct(id) {
    const response = await api.delete(`/vendor/products/${id}`)
    return response.data
  },

  // ✅ PRODUCT STATS
  async getProductStats() {
    return api.get('/vendor/products/stats')
  }
}
