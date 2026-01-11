import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

// Layout
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import ProtectedSubHeader from './components/layout/ProtectedSubHeader'

// Sidebars
import CartSidebar from './components/cart/CartSidebar'
import WishlistSidebar from './components/wishlist/WishlistSidebar'

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
import CreateProductPage from './pages/vendor/CreateProductPage'
import VendorProductsPage from './pages/vendor/VendorProductsPage'
import EditProductPage from './pages/vendor/EditProductPage'
import SellerOrdersPage from './pages/vendor/SellerOrdersPage'

// Store Pages
import StorePage from './pages/vendor/StorePage'
import CheckoutPage from './pages/vendor/CheckoutPage'
import PurchaseOrdersPage from './pages/vendor/PurchaseOrdersPage'
import OrderDetailsPage from './pages/vendor/OrderDetailsPage'

// Public Info Pages
import HowItWorks from './pages/HowItWorks'
import Testimonials from './pages/Testimonials'
import FAQ from './pages/FAQ'
import Shipping from './pages/Shipping'
import About from './pages/About'
import Contact from './pages/Contact'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import VendorLayout from './components/layout/VendorLayout'
import VendorOrderDetailsPage from './pages/vendor/VendorOrderDetailsPage'

// Component to handle ProtectedSubHeader visibility
const AppContent = () => {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  
  // Show ProtectedSubHeader on all protected routes except auth pages
  const showProtectedSubHeader = user && 
    !location.pathname.startsWith('/login') &&
    !location.pathname.startsWith('/register') &&
    !location.pathname.startsWith('/forgot-password') &&
    !location.pathname.startsWith('/reset-password') &&
    location.pathname !== '/pending-approval' &&
    location.pathname !== '/account-rejected' &&
    location.pathname !== '/account-suspended'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showProtectedSubHeader && <ProtectedSubHeader />}
      <main className=""> {/* Add padding for fixed header */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/account-rejected" element={<AccountRejectedPage />} />
          <Route path="/account-suspended" element={<AccountSuspendedPage />} />

          {/* Info Pages */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Store - Public Access */}
          <Route path="/store" element={<StorePage />} />

          {/* Protected Vendor Routes */}
          <Route
            path="/vendor/*"
            element={
              <ProtectedRoute>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            {/* Vendor Dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Vendor Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Vendor Products Management */}
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="products/create" element={<CreateProductPage />} />
            <Route path="products/edit/:id" element={<EditProductPage />} />

            {/* Vendor Sales Orders (Seller Orders) */}
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="orders/:id" element={<VendorOrderDetailsPage />} />
          </Route>

          {/* Protected Store Routes */}
          <Route
            path="/store/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/store/orders/*"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Routes>
                    <Route index element={<PurchaseOrdersPage />} />
                    <Route path=":id" element={<OrderDetailsPage />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Legacy Routes - Redirect to new structure */}
          <Route path="/dashboard" element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/vendor/profile" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

const App = () => {
  const cart = useSelector((state) => state.store?.cart || { items: [], itemCount: 0, total: 0 })
  const wishlist = useSelector((state) => state.store?.wishlist || { products: [] })
  
  const [showCart, setShowCart] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)

  // Handle cart/wishlist toggle events
  useEffect(() => {
    const handleToggleCart = () => {
      setShowWishlist(false)
      setShowCart(true)
    }
    
    const handleToggleWishlist = () => {
      setShowCart(false)
      setShowWishlist(true)
    }

    const handleCloseAll = () => {
      setShowCart(false)
      setShowWishlist(false)
    }

    window.addEventListener('toggleCart', handleToggleCart)
    window.addEventListener('toggleWishlist', handleToggleWishlist)
    window.addEventListener('closeAllSidebars', handleCloseAll)

    return () => {
      window.removeEventListener('toggleCart', handleToggleCart)
      window.removeEventListener('toggleWishlist', handleToggleWishlist)
      window.removeEventListener('closeAllSidebars', handleCloseAll)
    }
  }, [])

  const handleCloseCart = () => {
    setShowCart(false)
  }

  const handleCloseWishlist = () => {
    setShowWishlist(false)
  }

  return (
    <Router>
      <AppContent />
      
      {/* Global Sidebars */}
      <CartSidebar 
        isOpen={showCart}
        onClose={handleCloseCart}
      />
      
      <WishlistSidebar 
        isOpen={showWishlist}
        onClose={handleCloseWishlist}
      />
    </Router>
  )
}

export default App