import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice'
import { Building2, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { isLoading, error, isAuthenticated, userType } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'vendor',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
  const from = location.state?.from?.pathname || (userType === 'admin' ? '/admin/dashboard' : '/dashboard')
  
  useEffect(() => {
    if (isAuthenticated) {
      if (userType === 'admin') {
        window.location.href = 'http://localhost:5174/admin/dashboard'
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [isAuthenticated, navigate, from, userType])
  
  useEffect(() => {
    dispatch(clearError())
    
    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedEmail')
    const savedUserType = localStorage.getItem('savedUserType')
    const rememberMe = localStorage.getItem('rememberMe') === 'true'
    
    if (rememberMe && savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        userType: savedUserType || 'vendor',
        rememberMe: true
      }))
    }
  }, [dispatch])
  
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
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Save credentials if remember me is checked
    if (formData.rememberMe) {
      localStorage.setItem('savedEmail', formData.email)
      localStorage.setItem('savedUserType', formData.userType)
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedUserType')
      localStorage.setItem('rememberMe', 'false')
    }
    
    try {
      await dispatch(login({
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      })).unwrap()
      
      // Navigation is handled by useEffect
    } catch (err) {
      console.error('Login failed:', err)
    }
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to access your vendor account</p>
      </div>
      
      {/* User Type Selector */}
      <div className="mb-6">
        <div className="flex rounded-lg border border-teal-200 overflow-hidden bg-gray-50">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, userType: 'vendor' })}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
              formData.userType === 'vendor'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 className="h-4 w-4 inline-block mr-2" />
            Vendor
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, userType: 'admin' })}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
              formData.userType === 'admin'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="h-4 w-4 inline-block mr-2" />
            Admin
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {formData.userType === 'vendor' 
            ? 'Access your pharmacy vendor account' 
            : 'Administrator access only'}
        </p>
      </div>
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${
                formErrors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`appearance-none block w-full pl-10 pr-10 py-2.5 border ${
                formErrors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>

        {/* Remember Me & Terms */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              'Sign In'
            )}
          </button>
        </div>
      </form>
      
      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New to Medical Marketplace?</span>
          </div>
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-6">
        <Link
          to="/register"
          className="w-full flex justify-center py-2.5 px-4 border border-teal-600 rounded-lg shadow-sm text-sm font-medium text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Register as a Vendor
        </Link>
      </div>
      
      {/* Terms */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-teal-600 hover:text-teal-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-teal-600 hover:text-teal-500">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm