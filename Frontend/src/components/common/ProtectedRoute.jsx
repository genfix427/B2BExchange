import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getCurrentUser } from '../../store/slices/authSlice'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [], requireApproval = true }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  
  const { isAuthenticated, isLoading, user, userType } = useSelector((state) => state.auth)
  
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isAuthenticated, isLoading])
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />
  }
  
  // Check vendor approval status
  if (requireApproval && userType === 'vendor' && user?.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />
  }
  
  return children
}

export default ProtectedRoute