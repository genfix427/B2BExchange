import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, admin } = useSelector(
    (state) => state.adminAuth
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading admin...</span>
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" replace />
  }

  // Role check (ALLOW admin + super_admin)
  if (!['admin', 'super_admin'].includes(admin.role)) {
    return <Navigate to="/admin/login" replace />
  }

  // Permission-based route protection (example)
  if (
    location.pathname.includes('/admin/vendors') &&
    !admin.permissions?.canApproveVendors
  ) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
