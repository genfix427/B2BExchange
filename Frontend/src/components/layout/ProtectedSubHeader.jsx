import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  Package,
  Home,
  Store,
  BarChart3,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import { 
  fetchCart, 
  fetchWishlist,
  selectCartItemCount,
  selectWishlistCount 
} from '../../store/slices/storeSlice'

const ProtectedSubHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const cartItemCount = useSelector(selectCartItemCount)
  const wishlistCount = useSelector(selectWishlistCount)

  useEffect(() => {
    if (user) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
    }
  }, [dispatch, user, location.pathname])

  if (!user) return null

  const handleToggleCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('toggleCart'))
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('toggleWishlist'))
  }

  const handleLogout = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('logout'))
  }

  return (
    <div className="bg-gray-800 text-white mt-22">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          {/* Left Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              to="/vendor/dashboard"
              className={`flex items-center space-x-2 text-sm ${
                location.pathname === '/vendor/dashboard' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/store"
              className={`flex items-center space-x-2 text-sm ${
                location.pathname === '/store' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
            
            <Link
              to="/vendor/products"
              className={`flex items-center space-x-2 text-sm ${
                location.pathname.includes('/vendor/products') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Products</span>
            </Link>
            
            <Link
              to="/vendor/orders"
              className={`flex items-center space-x-2 text-sm ${
                location.pathname === '/vendor/orders' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Sales Orders</span>
            </Link>
            
            <Link
              to="/store/orders"
              className={`flex items-center space-x-2 text-sm ${
                location.pathname.includes('/store/orders') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Purchases</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className="relative p-1 hover:text-gray-300"
              title="Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={handleToggleCart}
              className="relative p-1 hover:text-gray-300"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-sm hover:text-gray-300">
                <User className="w-5 h-5" />
                <span className="truncate max-w-xs">
                  {user.pharmacyInfo?.legalBusinessName || user.email}
                </span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link
                  to="/vendor/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </Link>
                <Link
                  to="/store/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Purchases
                </Link>
                <Link
                  to="/vendor/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sales Orders
                </Link>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedSubHeader