import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireVendor = false,
  requireApprovedVendor = false
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );

  // ⏳ Wait for auth hydration
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ❌ Not logged in
  if (requireAuth && (!isAuthenticated || !user)) {
    return (
      <Navigate
        to="/vendor/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ❌ Vendor role required
  if (requireVendor && user?.role !== 'vendor') {
    return <Navigate to="/vendor/login" replace />;
  }

  // ❌ Vendor exists but not approved
  if (
    requireApprovedVendor &&
    user?.role === 'vendor' &&
    user?.status !== 'approved'
  ) {
    const redirectState = {
      from: location.pathname,
      status: user.status
    };

    switch (user.status) {
      case 'pending':
        return <Navigate to="/account-pending" state={redirectState} replace />;
      case 'rejected':
        return <Navigate to="/account-rejected" state={redirectState} replace />;
      case 'suspended':
        return <Navigate to="/account-suspended" state={redirectState} replace />;
      default:
        return <Navigate to="/vendor/login" replace />;
    }
  }

  // ✅ Access granted
  return children;
};

export default ProtectedRoute;
