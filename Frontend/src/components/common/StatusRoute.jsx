import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from './LoadingSpinner'

const StatusRoute = ({ allowedStatuses, children }) => {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  // ❌ Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // ❌ Not vendor
  if (user.role !== 'vendor') {
    return <Navigate to="/login" replace />
  }

  // ❌ Status not allowed
  if (!allowedStatuses.includes(user.status)) {
    return <Navigate to="/login" replace />
  }

  // ✅ Allowed
  return children
}

export default StatusRoute
