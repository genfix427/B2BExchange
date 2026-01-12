import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/auth.service'
import { ApiError } from '../../services/api'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response.data
    } catch (error) {
      // Log the full error for debugging
      console.error('Login thunk error:', error)
      
      // Check if it's an ApiError with status information
      if (error.data?.data?.status) {
        return rejectWithValue({
          message: error.message,
          status: error.data.data.status,
          rejectionReason: error.data.data.rejectionReason,
          suspensionReason: error.data.data.suspensionReason,
          isStatusError: true
        })
      }
      
      // Check if status is at root level
      if (error.data?.status) {
        return rejectWithValue({
          message: error.message,
          status: error.data.status,
          rejectionReason: error.data.rejectionReason,
          suspensionReason: error.data.suspensionReason,
          isStatusError: true
        })
      }
      
      // For other errors
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)



export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return null
    } catch (error) {
      // Still clear local state even if API fails
      authService.clearStorage()
      return rejectWithValue(error.message)
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser()
      return data
    } catch (error) {
      // Handle status change errors
      if (error instanceof ApiError && error.statusCode === 403) {
        return rejectWithValue({
          message: error.message,
          data: error.data,
          isStatusError: true
        })
      }
      // Return null for 401 (not authenticated)
      if (error.statusCode === 401) {
        return null
      }
      return rejectWithValue({
        message: error.message || 'Failed to get user',
        isStatusError: false
      })
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const data = await authService.forgotPassword(email)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const data = await authService.resetPassword(token, password)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userType: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.userType = action.payload?.role
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.userType = null
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
  state.isLoading = false

  const vendor = action.payload
  const status = vendor.status

  state.user = vendor
  state.userType = 'vendor'

  // ✅ ONLY approved vendors are authenticated
  state.isAuthenticated = status === 'approved'

  state.error = null
})

      .addCase(login.rejected, (state, action) => {
        state.isLoading = false

        // ⛔ DO NOT reset auth for status-based rejections
        if (action.payload?.isStatusError) {
          state.error = null
          return
        }

        // Normal login error
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload?.message
      })


      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.userType = null
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        // Still clear auth state even if API fails
        state.isAuthenticated = false
        state.user = null
        state.userType = null
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.isAuthenticated = true
          state.user = action.payload
          state.userType = action.payload.role
        } else {
          state.isAuthenticated = false
          state.user = null
          state.userType = null
        }
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.userType = null
        state.error = action.payload
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setUser, clearAuth } = authSlice.actions
export default authSlice.reducer