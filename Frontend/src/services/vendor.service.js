import { api } from './api'

export const vendorService = {
  async registerVendor(formData) {
    // Note: Don't set Content-Type header, browser will set it with boundary
    const response = await api.upload('/vendors/register', formData)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/vendors/profile')
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.put('/vendors/profile', profileData)
    return response.data
  },

  // NEW: Bank account related endpoints
  async updateBankAccount(bankAccountData) {
    const response = await api.put('/vendors/bank-account', bankAccountData)
    return response.data
  },

  async getBankAccount() {
    const response = await api.get('/vendors/bank-account')
    console.log('Bank account response:', response)
    return response.data
  },

  async uploadDocument(file, documentType) {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', documentType)
    
    const response = await api.upload('/vendors/documents', formData)
    return response.data
  },

  async getStats() {
    const response = await api.get('/vendors/stats')
    return response.data
  },

  async getVendorOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/vendor/orders${query ? `?${query}` : ''}`);
  },

  // Update order status
  async updateOrderStatus(orderId, data) {
    return api.put(`/vendor/orders/${orderId}/status`, data);
  },

  // Get vendor order details
  async getVendorOrderDetails(orderId) {
    return api.get(`/vendor/orders/${orderId}`);
  },

  // Get vendor dashboard stats
  async getVendorStats() {
    return api.get('/vendor/stats');
  }
}