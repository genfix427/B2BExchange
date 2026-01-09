import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layout
import Header from './components/common/Header'
import Footer from './components/common/Footer'

// Public Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import AccountRejectedPage from './pages/auth/AccountRejectedPage'
import AccountSuspendedPage from './pages/auth/AccountSuspendedPage'

// Protected Pages
import DashboardPage from './pages/vendor/DashboardPage'
import ProfilePage from './pages/vendor/ProfilePage'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import HowItWorks from './pages/HowItWorks'
import Testimonials from './pages/Testimonials'
import FAQ from './pages/FAQ'
import Shipping from './pages/Shipping'
import About from './pages/About'
import Contact from './pages/Contact'
import CreateProductPage from './pages/vendor/CreateProductPage'
import VendorProductsPage from './pages/vendor/VendorProductsPage'

const App = () => {

  return (
    <Router>
      <Header />
      <div className="min-h-screen flex flex-col">
        <Routes>

          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path='/how-it-works' element={<HowItWorks />} />
          <Route path='/testimonials' element={<Testimonials />} />
          <Route path='/faqs' element={<FAQ />} />
          <Route path='/shipping' element={<Shipping />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />

          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/account-rejected" element={<AccountRejectedPage />} />
          <Route path="/account-suspended" element={<AccountSuspendedPage />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute>
                <VendorProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendor/products/create"
            element={
              <ProtectedRoute>
                <CreateProductPage />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/vendor/products/edit/:id"
            element={
              <ProtectedRoute>
                <EditProductPage />
              </ProtectedRoute>
            }
          /> */}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  )
}

export default App
