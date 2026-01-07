import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as vendorService from '../../services/vendor.service'

export const registerVendor = createAsyncThunk(
  'registration/registerVendor',
  async (registrationData, { rejectWithValue }) => {
    try {
      const data = await vendorService.registerVendor(registrationData)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
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
    // Step 7
    documents: null,
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
      if (state.currentStep < 7) {
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
        case 7:
          state.formData.documents = data
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