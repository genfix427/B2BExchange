import { api } from './api'

export const vendorService = {
  async registerVendor(registrationData) {
    // Create FormData for file upload
    const formData = new FormData()
    
    // Add JSON data
    formData.append('pharmacyInfo', JSON.stringify(registrationData.pharmacyInfo))
    formData.append('pharmacyOwner', JSON.stringify(registrationData.pharmacyOwner))
    formData.append('primaryContact', JSON.stringify(registrationData.primaryContact))
    formData.append('pharmacyLicense', JSON.stringify(registrationData.pharmacyLicense))
    formData.append('pharmacyQuestions', JSON.stringify(registrationData.pharmacyQuestions))
    formData.append('referralInfo', JSON.stringify(registrationData.referralInfo))
    formData.append('email', registrationData.email)
    formData.append('password', registrationData.password)
    
    // Add documents
    registrationData.documents.forEach((file, index) => {
      formData.append('documents', file)
    })
    
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
  }
}