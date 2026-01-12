import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const registerVendor = createAsyncThunk(
  'registration/registerVendor',
  async (documentFiles, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const { formData } = state.registration
      
      console.log('Submitting registration with:', {
        email: formData.email,
        documents: documentFiles.length
      });

      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add JSON data (stringify each object) - Updated for 8 steps
      if (formData.pharmacyInfo) {
        formDataToSend.append('pharmacyInfo', JSON.stringify(formData.pharmacyInfo))
      }
      if (formData.pharmacyOwner) {
        formDataToSend.append('pharmacyOwner', JSON.stringify(formData.pharmacyOwner))
      }
      if (formData.primaryContact) {
        formDataToSend.append('primaryContact', JSON.stringify(formData.primaryContact))
      }
      if (formData.pharmacyLicense) {
        formDataToSend.append('pharmacyLicense', JSON.stringify(formData.pharmacyLicense))
      }
      if (formData.pharmacyQuestions) {
        formDataToSend.append('pharmacyQuestions', JSON.stringify(formData.pharmacyQuestions))
      }
      if (formData.referralInfo) {
        formDataToSend.append('referralInfo', JSON.stringify(formData.referralInfo))
      }
      // NEW: Add bank account data
      if (formData.bankAccount) {
        formDataToSend.append('bankAccount', JSON.stringify(formData.bankAccount))
      }
      
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      
      // Add document files
      documentFiles.forEach((file, index) => {
        if (file) {
          formDataToSend.append('documents', file, file.name || `document-${index}`)
        }
      })

      console.log('FormData entries:', Array.from(formDataToSend.entries()).map(([key, value]) => 
        [key, typeof value === 'string' ? value.substring(0, 100) + '...' : value.name || 'File']
      ));
      
      // Call the API directly
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_BASE_URL}/vendors/register`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
        // Don't set Content-Type header, browser will set it with boundary
      })
      
      const data = await response.json()
      
      console.log('API Response:', { status: response.status, data });
      
      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status ${response.status}`)
      }
      
      return data.data
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed. Please try again.')
    }
  }
)

const initialState = {
  currentStep: 1,
  formData: {
    // Step 1
    pharmacyInfo: null,
    // Step 2
    pharmacyOwner: null,
    // Step 3
    primaryContact: null,
    // Step 4
    pharmacyLicense: null,
    // Step 5
    pharmacyQuestions: null,
    // Step 6
    referralInfo: null,
    // Step 7: NEW - Bank Account Details
    bankAccount: null,
    // Step 8: Documents - Only store metadata, NOT File objects
    documents: [],
    // Auth
    email: '',
    password: ''
  },
  isLoading: false,
  error: null,
  registrationComplete: false,
  registrationId: null
}

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.currentStep = action.payload
    },
    nextStep: (state) => {
      if (state.currentStep < 8) { // Updated from 7 to 8
        state.currentStep += 1
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1
      }
    },
    updateFormData: (state, action) => {
      const { step, data } = action.payload
      switch(step) {
        case 1:
          state.formData.pharmacyInfo = data
          break
        case 2:
          state.formData.pharmacyOwner = data
          break
        case 3:
          state.formData.primaryContact = data
          break
        case 4:
          state.formData.pharmacyLicense = data
          break
        case 5:
          state.formData.pharmacyQuestions = data
          break
        case 6:
          state.formData.referralInfo = data
          break
        case 7: // NEW: Bank Account
          state.formData.bankAccount = data
          break
        case 8: // UPDATED: Documents from step 7 to 8
          // Only store metadata, NOT File objects
          if (Array.isArray(data)) {
            state.formData.documents = data.map(doc => ({
              name: doc?.name || '',
              size: doc?.size || 0,
              type: doc?.type || '',
              lastModified: doc?.lastModified || Date.now()
            }))
          }
          break
        default:
          break
      }
    },
    updateAuthData: (state, action) => {
      const { email, password } = action.payload
      state.formData.email = email
      state.formData.password = password
    },
    clearRegistrationData: (state) => {
      state.currentStep = 1
      state.formData = initialState.formData
      state.isLoading = false
      state.error = null
      state.registrationComplete = false
      state.registrationId = null
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerVendor.fulfilled, (state, action) => {
        state.isLoading = false
        state.registrationComplete = true
        state.registrationId = action.payload.id
        // Clear form data after successful registration
        state.formData = initialState.formData
      })
      .addCase(registerVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  setStep,
  nextStep,
  prevStep,
  updateFormData,
  updateAuthData,
  clearRegistrationData,
  setError,
  clearError
} = registrationSlice.actions

export default registrationSlice.reducer