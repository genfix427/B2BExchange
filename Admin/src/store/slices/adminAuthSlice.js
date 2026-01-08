import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminAuthService } from '../../services/adminAuth.service'

export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await adminAuthService.login(email, password)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const adminLogout = createAsyncThunk(
  'adminAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await adminAuthService.logout()
      return null
    } catch (error) {
      // Still clear local state even if API fails
      adminAuthService.clearAdminStorage()
      return rejectWithValue(error.message)
    }
  }
)

export const getCurrentAdmin = createAsyncThunk(
  'adminAuth/getCurrentAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminAuthService.getCurrentAdmin()
      return data
    } catch (error) {
      if (error.statusCode === 401) {
        return null
      }
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  admin: adminAuthService.getStoredAdmin(),
  isAuthenticated: adminAuthService.isAdminAuthenticated(),
  isLoading: false,
  error: null,
  permissions: adminAuthService.getAdminPermissions()
}

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null
    },
    setAdminData: (state, action) => {
      state.admin = action.payload
      state.isAuthenticated = !!action.payload
      if (action.payload?.permissions) {
        state.permissions = action.payload.permissions
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.admin = action.payload
        state.permissions = action.payload?.permissions || {}
        state.error = null
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.admin = null
        state.permissions = {}
      })
      
      // Admin Logout
      .addCase(adminLogout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.admin = null
        state.permissions = {}
        state.error = null
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.admin = null
        state.permissions = {}
      })
      
      // Get Current Admin
      .addCase(getCurrentAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.isAuthenticated = true
          state.admin = action.payload
          state.permissions = action.payload?.permissions || {}
        } else {
          state.isAuthenticated = false
          state.admin = null
          state.permissions = {}
        }
        state.error = null
      })
      .addCase(getCurrentAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.admin = null
        state.permissions = {}
        state.error = action.payload
      })
  }
})

export const { clearAdminError, setAdminData } = adminAuthSlice.actions
export default adminAuthSlice.reducer