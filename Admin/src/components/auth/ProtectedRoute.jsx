import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getCurrentUser } from '../../store/slices/authSlice'

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  
  const { isAuthenticated, isLoading, user, userType } = useSelector((state) => state.auth)
  
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isAuthenticated, isLoading])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  
  if (requireAdmin && userType !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

export default ProtectedRoute