import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  let redirectPath = null

  // 🔹 Handle status-based redirects safely
  const statusInfo = localStorage.getItem('vendorStatusInfo')
  if (statusInfo) {
    try {
      const parsed = JSON.parse(statusInfo)

      if (parsed?.status === 'rejected') {
        redirectPath = '/account-rejected'
      } else if (parsed?.status === 'suspended') {
        redirectPath = '/account-suspended'
      } else if (parsed?.status === 'pending') {
        redirectPath = '/pending-approval'
      }
    } catch {
      localStorage.removeItem('vendorStatusInfo')
    }
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  // 🔹 Auth check
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  // 🔹 Role check
  if (user.role !== 'vendor') {
    return <Navigate to="/login" replace />
  }

  // 🔹 Approval check
  if (user.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />
  }

  return children
}

export default ProtectedRoute
