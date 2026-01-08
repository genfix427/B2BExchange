import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'

// Layout
import Header from './components/common/Header'
import Footer from './components/common/Footer'

// Public Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import AccountRejectedPage from './pages/auth/AccountRejectedPage'
import AccountSuspendedPage from './pages/auth/AccountSuspendedPage'

// Protected Pages
import DashboardPage from './pages/vendor/DashboardPage'
import ProfilePage from './pages/vendor/ProfilePage'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

const App = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth)

  // 🔹 Run auth check ONCE
  useEffect(() => {
    const hasSessionUser = sessionStorage.getItem('userData')

    if (hasSessionUser) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])


  // 🔹 Immediate redirect for suspended/rejected users
  useEffect(() => {
    const statusInfo = localStorage.getItem('vendorStatusInfo')
    if (!statusInfo) return

    try {
      const { status } = JSON.parse(statusInfo)
      localStorage.removeItem('vendorStatusInfo')

      if (status === 'rejected') {
        window.location.replace('/account-rejected')
      } else if (status === 'suspended') {
        window.location.replace('/account-suspended')
      } else if (status === 'pending') {
        window.location.replace('/pending-approval')
      }
    } catch {
      localStorage.removeItem('vendorStatusInfo')
    }
  }, [])

  // 🔹 Global loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>

          {/* Public */}
          <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/account-rejected" element={<AccountRejectedPage />} />
          <Route path="/account-suspended" element={<AccountSuspendedPage />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Header />
                <DashboardPage />
                <Footer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Header />
                <ProfilePage />
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
