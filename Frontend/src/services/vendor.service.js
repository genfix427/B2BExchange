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
  }
}