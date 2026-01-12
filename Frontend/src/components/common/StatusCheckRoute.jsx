import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from './LoadingSpinner'

const StatusCheckRoute = ({ children, status }) => {
  const location = useLocation()
  const { isLoading, user } = useSelector((state) => state.auth)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  // ❗ ONLY check user existence
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // ❗ Role check is OK
  if (user.role !== 'vendor') {
    return <Navigate to="/" replace />
  }

  // ❗ STATUS-based redirect ONLY
  if (user.status !== status) {
    switch (user.status) {
      case 'approved':
        return <Navigate to="/vendor/dashboard" replace />
      case 'pending':
        return <Navigate to="/account-pending" replace />
      case 'rejected':
        return <Navigate to="/account-rejected" replace />
      case 'suspended':
        return <Navigate to="/account-suspended" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  // ✅ Correct page
  return children
}

export default StatusCheckRoute
