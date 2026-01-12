import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice'
import { Building2, AlertCircle, Lock, XCircle, Clock, ArrowRight } from 'lucide-react'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoading, error, user } = useSelector((state) => state.auth)


  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [formErrors, setFormErrors] = useState({})
  const [showStatusMessage, setShowStatusMessage] = useState(false)
  const [statusMessage, setStatusMessage] = useState({})
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Use ref to track if we've already processed a redirect
  const hasRedirectedRef = useRef(false)

  const from = location.state?.from?.pathname || '/vendor/dashboard'

  // Clear any previous redirect flags on mount
  useEffect(() => {
    hasRedirectedRef.current = false
    setIsRedirecting(false)
    dispatch(clearError())
  }, [dispatch])

  // Check if user is already logged in with a status
  useEffect(() => {
  if (!user || hasRedirectedRef.current) return
  handleUserStatusRedirect(user)
}, [user])


  // Handle redirect based on user status
  const handleUserStatusRedirect = (userData) => {
    if (hasRedirectedRef.current) return // Prevent multiple redirects
    
    const { status, rejectionReason, suspensionReason } = userData
    
    const redirectState = {
      from: location.pathname,
      status: status,
      ...(rejectionReason && { rejectionReason }),
      ...(suspensionReason && { suspensionReason })
    }

    hasRedirectedRef.current = true
    setIsRedirecting(true)

    switch (status) {
      case 'pending':
        navigate('/account-pending', { 
          state: redirectState,
          replace: true 
        })
        break
      case 'rejected':
        navigate('/account-rejected', {
          state: redirectState,
          replace: true
        })
        break
      case 'suspended':
        navigate('/account-suspended', {
          state: redirectState,
          replace: true
        })
        break
      case 'approved':
        navigate(from, { replace: true })
        break
      default:
        navigate('/')
    }
  }

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
    setShowStatusMessage(false)
    return Object.keys(errors).length === 0
  }

  const handleStatusRedirect = (errorData) => {
    if (hasRedirectedRef.current) return // Prevent multiple redirects
    
    const { status, rejectionReason, suspensionReason } = errorData
    
    const redirectState = {
      from: location.pathname,
      status: status,
      ...(rejectionReason && { rejectionReason }),
      ...(suspensionReason && { suspensionReason }),
      email: formData.email // Include email for the status page
    }

    hasRedirectedRef.current = true
    setIsRedirecting(true)

    switch (status) {
      case 'pending':
        navigate('/account-pending', { 
          state: redirectState,
          replace: true 
        })
        break
      case 'rejected':
        navigate('/account-rejected', {
          state: redirectState,
          replace: true
        })
        break
      case 'suspended':
        navigate('/account-suspended', {
          state: redirectState,
          replace: true
        })
        break
      default:
        // Stay on login page
        setIsRedirecting(false)
        hasRedirectedRef.current = false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    // Reset redirect flag
    hasRedirectedRef.current = false
    setIsRedirecting(false)

    try {
      const result = await dispatch(login(formData)).unwrap()
      
      // Approved vendors will be handled by useEffect
    } catch (err) {
      console.error('Login error details:', err)
      
      // Check for status-related errors
      if (err.status === 'pending' || err.status === 'rejected' || err.status === 'suspended') {
        // Show status message briefly, then redirect
        setShowStatusMessage(true)
        setStatusMessage({
          type: err.status,
          title: getStatusTitle(err.status),
          message: getStatusMessage(err.status),
          reason: err.rejectionReason || err.suspensionReason,
          icon: getStatusIcon(err.status)
        })
      } else {
        // Show generic error
        setStatusMessage({
          type: 'error',
          title: 'Login Failed',
          message: err.message || 'Invalid email or password. Please try again.',
          icon: AlertCircle
        })
        setShowStatusMessage(true)
      }
    }
  }

  // Helper functions for status messages
  const getStatusTitle = (status) => {
    switch (status) {
      case 'pending': return 'Account Pending Approval'
      case 'rejected': return 'Account Not Approved'
      case 'suspended': return 'Account Suspended'
      default: return 'Account Issue'
    }
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your account is currently under review by our admin team. This process typically takes 24-48 hours.'
      case 'rejected':
        return 'Your vendor application was not approved. Please check your email for details or contact support.'
      case 'suspended':
        return 'Your account has been temporarily suspended. Please contact support for assistance.'
      default:
        return 'There is an issue with your account.'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock
      case 'rejected': return XCircle
      case 'suspended': return Lock
      default: return AlertCircle
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'rejected': return 'bg-rose-50 border-rose-200 text-rose-800'
      case 'suspended': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  // Show loading overlay when redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Redirecting to account status page...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Medical Marketplace</h2>
              <p className="text-sm text-gray-600">Vendor Portal</p>
            </div>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900">
          Vendor Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your vendor dashboard and manage your business
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-gray-200 sm:px-10">
          
          {/* Status Message Display */}
          {showStatusMessage && statusMessage && (
            <div className={`mb-6 rounded-xl border p-4 ${getStatusColor(statusMessage.type)}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {React.createElement(statusMessage.icon, {
                    className: "h-5 w-5"
                  })}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-bold">{statusMessage.title}</h3>
                  <div className="mt-1 text-sm">
                    <p>{statusMessage.message}</p>
                    {statusMessage.reason && (
                      <div className="mt-2 p-2 bg-white/50 rounded">
                        <p className="font-medium">Reason:</p>
                        <p className="text-sm mt-1">{statusMessage.reason}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Auto-redirect indicator */}
                  {(statusMessage.type === 'pending' || statusMessage.type === 'rejected' || statusMessage.type === 'suspended') && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Redirecting to status page...</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        if (statusMessage.type === 'pending') {
                          handleStatusRedirect({
                            status: 'pending',
                            rejectionReason: statusMessage.reason,
                            suspensionReason: statusMessage.reason
                          })
                        } else if (statusMessage.type === 'rejected') {
                          handleStatusRedirect({
                            status: 'rejected',
                            rejectionReason: statusMessage.reason,
                            suspensionReason: statusMessage.reason
                          })
                        } else if (statusMessage.type === 'suspended') {
                          handleStatusRedirect({
                            status: 'suspended',
                            rejectionReason: statusMessage.reason,
                            suspensionReason: statusMessage.reason
                          })
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 bg-white border border-current rounded-lg text-sm font-medium hover:bg-white/70 transition-colors"
                    >
                      Go Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowStatusMessage(false)
                        setFormData({ email: '', password: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium underline hover:no-underline"
                    >
                      Try different credentials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {error && !showStatusMessage && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
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
                    setFormErrors({ ...formErrors, email: '' })
                    setShowStatusMessage(false)
                  }}
                  disabled={isLoading || isRedirecting}
                  className={`block w-full px-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
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
                    setFormErrors({ ...formErrors, password: '' })
                    setShowStatusMessage(false)
                  }}
                  disabled={isLoading || isRedirecting}
                  className={`block w-full px-4 py-3 rounded-xl border ${formErrors.password ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter your password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              <div className="mt-1 flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex={isLoading || isRedirecting ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : isRedirecting ? (
                  'Redirecting...'
                ) : (
                  'Sign in to Vendor Portal'
                )}
              </button>
            </div>
          </form>

          {/* Debug: Direct test buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Debug Navigation Test:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => navigate('/account-pending', { 
                  state: { 
                    from: location.pathname,
                    status: 'pending',
                    email: 'test@example.com'
                  },
                  replace: true 
                })}
                className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 disabled:opacity-50"
                disabled={isRedirecting}
              >
                Go to Pending Page
              </button>
              <button
                onClick={() => navigate('/account-rejected', {
                  state: { 
                    from: location.pathname,
                    status: 'rejected',
                    reason: 'Test rejection reason',
                    email: 'test@example.com'
                  },
                  replace: true
                })}
                className="px-3 py-2 bg-rose-100 text-rose-800 rounded-lg text-sm font-medium hover:bg-rose-200 disabled:opacity-50"
                disabled={isRedirecting}
              >
                Go to Rejected Page
              </button>
              <button
                onClick={() => navigate('/account-suspended', {
                  state: { 
                    from: location.pathname,
                    status: 'suspended',
                    reason: 'Test suspension reason',
                    email: 'test@example.com'
                  },
                  replace: true
                })}
                className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                disabled={isRedirecting}
              >
                Go to Suspended Page
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use these buttons to test if navigation works independently
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage