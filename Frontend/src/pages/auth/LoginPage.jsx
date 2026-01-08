import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice'
import { Building2 } from 'lucide-react'
import { clearAuth } from '../../store/slices/authSlice'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [formErrors, setFormErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  // Clear any stored status info on mount
  useEffect(() => {
    localStorage.removeItem('vendorStatusInfo')
    dispatch(clearError())
  }, [dispatch])

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user?.status === 'approved') {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  // Handle stored status info (from previous failed login)
  useEffect(() => {
    const handleStoredStatus = () => {
      try {
        const statusInfo = localStorage.getItem('vendorStatusInfo')
        if (statusInfo) {
          const { status, rejectionReason, suspensionReason } = JSON.parse(statusInfo)
          localStorage.removeItem('vendorStatusInfo')

          handleStatusRedirect(status, rejectionReason, suspensionReason)
        }
      } catch (error) {
        console.error('Error handling stored status:', error)
        localStorage.removeItem('vendorStatusInfo')
      }
    }

    handleStoredStatus()
  }, [navigate])

  const validateForm = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setFormErrors(errors)
    setApiError('')
    return Object.keys(errors).length === 0
  }

  const handleStatusRedirect = (status, rejectionReason, suspensionReason) => {
    switch (status) {
      case 'pending':
        navigate('/pending-approval', { replace: true })
        break
      case 'rejected':
        navigate('/account-rejected', {
          replace: true,
          state: { reason: rejectionReason || 'Your application has been rejected.' }
        })
        break
      case 'suspended':
        navigate('/account-suspended', {
          replace: true,
          state: { reason: suspensionReason || 'Your account has been suspended.' }
        })
        break
      default:
        setApiError('Account not approved')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await dispatch(login(formData)).unwrap()
      // Approved users handled by useEffect
    } catch (err) {
      if (err?.isStatusError) {
        dispatch(clearAuth()) // ⛔ stop auth guards

        if (err.status === 'pending') {
          navigate('/pending-approval', { replace: true })
          return
        }

        if (err.status === 'rejected') {
          navigate('/account-rejected', {
            replace: true,
            state: { reason: err.rejectionReason }
          })
          return
        }

        if (err.status === 'suspended') {
          navigate('/account-suspended', {
            replace: true,
            state: { reason: err.suspensionReason }
          })
          return
        }
      }

      setApiError(err?.message || 'Login failed')
    }

  }





  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical Marketplace</h2>
              <p className="text-sm text-gray-600">Vendor Portal</p>
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Vendor Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your vendor dashboard and manage your business
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* API Error Display - only for non-status errors */}
            {apiError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setApiError('')
                  }}
                  className={`appearance-none block w-full px-3 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="vendor@company.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setApiError('')
                  }}
                  className={`appearance-none block w-full px-3 py-2 border ${formErrors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in to Vendor Portal'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have a vendor account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register as a Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage