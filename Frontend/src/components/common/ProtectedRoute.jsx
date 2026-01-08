import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from '../common/LoadingSpinner' // adjust path if needed

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  )

  // ✅ Only block THIS route, not the whole app
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  // ❌ Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // ❌ Wrong role
  if (user.role !== 'vendor') {
    return <Navigate to="/login" replace />
  }

  // ❌ Vendor exists but not approved
  if (user.status !== 'approved') {
    switch (user.status) {
      case 'pending':
        return <Navigate to="/pending-approval" replace />
      case 'rejected':
        return <Navigate to="/account-rejected" replace />
      case 'suspended':
        return <Navigate to="/account-suspended" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  // ✅ Approved vendor → allow access
  return children
}

export default ProtectedRoute
