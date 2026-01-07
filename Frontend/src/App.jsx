import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'

// Layout Components
import Header from './components/common/Header'
import Footer from './components/common/Footer'

// Public Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'

// Protected Pages
import ProfilePage from './pages/vendor/ProfilePage'
import DashboardPage from './pages/vendor/DashboardPage'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

const App = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, user, userType } = useSelector((state) => state.auth)

  // Check authentication status on mount
  useEffect(() => {
    // Always try to get current user on mount
    dispatch(getCurrentUser())
  }, [dispatch])

  // Show loading spinner only on initial load
  if (isLoading && !isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-gray-600">Loading...</span>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {userType === 'vendor' && user?.status === 'approved' ? (
                    <DashboardPage />
                  ) : userType === 'vendor' && user?.status === 'pending' ? (
                    <Navigate to="/pending-approval" replace />
                  ) : userType === 'admin' ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )}
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  {userType === 'vendor' && user?.status === 'approved' ? (
                    <ProfilePage />
                  ) : userType === 'vendor' && user?.status === 'pending' ? (
                    <Navigate to="/pending-approval" replace />
                  ) : userType === 'admin' ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App