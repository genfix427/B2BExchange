import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children, requireApprovedVendor = true }) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  )

  // ✅ Only block THIS route, not the whole app
  if (isLoading) {
  return <LoadingSpinner />
}

// ⛔ HARD STOP — prevents flash
if (user && user.role === 'vendor' && user.status !== 'approved') {
  return null
}

if (!isAuthenticated || !user) {
  return <Navigate to="/login" replace />
}


  // ❌ Not logged in
  if (!isAuthenticated || !user) {
    // Store the attempted URL for redirect after login
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // If route requires vendor role
  if (requireApprovedVendor) {
    // ❌ Wrong role
    if (user.role !== 'vendor') {
      return <Navigate to="/login" replace />
    }

    // ❌ Vendor exists but not approved
    if (user.status !== 'approved') {
      // Store the original attempted path
      const redirectState = { 
        from: location.pathname,
        status: user.status 
      }
      
      switch (user.status) {
        case 'pending':
          return <Navigate to="/account-pending" state={redirectState} replace />
        case 'rejected':
          return <Navigate to="/account-rejected" state={redirectState} replace />
        case 'suspended':
          return <Navigate to="/account-suspended" state={redirectState} replace />
        default:
          return <Navigate to="/login" replace />
      }
    }
  }

  // ✅ Approved vendor or any authenticated user → allow access
  return children
}

export default ProtectedRoute