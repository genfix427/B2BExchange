import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import AdminLoginPage from './pages/auth/AdminLoginPage'
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage'
import VendorApprovalPage from './pages/dashboard/VendorApprovalPage'
import VendorManagementPage from './pages/dashboard/VendorManagementPage'
import NotFoundPage from './pages/NotFoundPage'
import VendorDetailPage from './pages/dashboard/VendorDetailPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import AdminSettingsPage from './pages/settings/AdminSettingsPage'

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Remove auto-fetch of current user on app load
  // Let ProtectedRoute handle it

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/admin/login" element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage />
        } />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="vendors/pending" element={<VendorApprovalPage />} />
          <Route path="vendors" element={<VendorManagementPage />} />
          <Route path="vendors/:id" element={<VendorDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App