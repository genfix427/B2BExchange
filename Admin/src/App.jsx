// import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { useDispatch } from 'react-redux'
// import { getCurrentAdmin } from './store/slices/adminAuthSlice'

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import AdminLoginPage from './pages/auth/AdminLoginPage'
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage'
import VendorApprovalPage from './pages/dashboard/VendorApprovalPage'
import VendorManagementPage from './pages/dashboard/VendorManagementPage'
import VendorDetailPage from './pages/dashboard/VendorDetailPage'
import AdminSettingsPage from './pages/settings/AdminSettingsPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import AdminProtectedRoute from './components/auth/ProtectedRoute'
import AdminOrdersPage from './pages/dashboard/AdminOrdersPage'
import AdminAnalyticsPage from './pages/dashboard/AdminAnalyticsPage'
import AdminProductsPage from './pages/dashboard/AdminProductsPage'

const App = () => {
  // const dispatch = useDispatch()

  // // Initialize admin authentication on app load
  // useEffect(() => {
  //   dispatch(getCurrentAdmin())
  // }, [dispatch])

  return (
    <Router>
      <Routes>
        {/* Public Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <DashboardLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="vendors/pending" element={<VendorApprovalPage />} />
          <Route path="vendors" element={<VendorManagementPage />} />
          <Route path="vendors/:id" element={<VendorDetailPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Root redirect to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App