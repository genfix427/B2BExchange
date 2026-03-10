// src/components/layout/ProtectedSubHeader.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  Package,
  Home,
  Store,
  BarChart3,
  Bell,
  Tag,
  ChevronDown,
  Check,
  CheckCheck,
  Trash2,
  ArrowRight,
  DollarSign,
  X,
  Clock,
  AlertCircle,
  Gift,
  ShoppingBag
} from 'lucide-react'
import {
  fetchCart,
  fetchWishlist,
  selectCartItemCount,
  selectWishlistCount
} from '../../store/slices/storeSlice'
import {
  fetchOfferStats,
  selectOfferCounts
} from '../../store/slices/offerSlice'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectUnreadCount,
  selectNotifications
} from '../../store/slices/notificationSlice'

const ProtectedSubHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const cartItemCount = useSelector(selectCartItemCount)
  const wishlistCount = useSelector(selectWishlistCount)
  const offerCounts = useSelector(selectOfferCounts)
  const unreadNotificationCount = useSelector(selectUnreadCount)
  const notifications = useSelector(selectNotifications)

  const [showOfferMenu, setShowOfferMenu] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const offerMenuRef = useRef(null)
  const notificationRef = useRef(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
      dispatch(fetchOfferStats())
      dispatch(fetchUnreadCount())
    }
  }, [dispatch, user, location.pathname])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      dispatch(fetchUnreadCount())
      dispatch(fetchOfferStats())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch, user])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (offerMenuRef.current && !offerMenuRef.current.contains(e.target)) {
        setShowOfferMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotificationPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleToggleNotifications = () => {
    if (!showNotificationPanel) {
      dispatch(fetchNotifications({ limit: 10 }))
    }
    setShowNotificationPanel(!showNotificationPanel)
    setShowOfferMenu(false)
  }

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id))
    }
    setShowNotificationPanel(false)

    // Navigate based on notification type
    if (notification.type.includes('offer') || notification.type.includes('counter')) {
      if (notification.type === 'offer_received') {
        navigate('/vendor/offers/received')
      } else {
        navigate('/vendor/offers/sent')
      }
    } else if (notification.type.includes('order')) {
      if (notification.relatedOrder) {
        navigate(`/vendor/orders/${notification.relatedOrder}`)
      }
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'offer_received':
        return <Gift className="w-4 h-4 text-blue-500" />
      case 'offer_accepted':
      case 'counter_accepted':
        return <Check className="w-4 h-4 text-green-500" />
      case 'offer_rejected':
      case 'counter_rejected':
        return <X className="w-4 h-4 text-red-500" />
      case 'offer_countered':
        return <DollarSign className="w-4 h-4 text-orange-500" />
      case 'order_created':
      case 'new_order':
        return <ShoppingBag className="w-4 h-4 text-teal-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
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

            {/* Offers Dropdown */}
            <div className="relative" ref={offerMenuRef}>
              <button
                onClick={() => {
                  setShowOfferMenu(!showOfferMenu)
                  setShowNotificationPanel(false)
                }}
                className={`flex items-center space-x-2 text-sm ${
                  location.pathname.includes('/vendor/offers') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Offers</span>
                {offerCounts.total > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {offerCounts.total}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${showOfferMenu ? 'rotate-180' : ''}`} />
              </button>

              {showOfferMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <Link
                    to="/vendor/offers/received"
                    onClick={() => setShowOfferMenu(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Received Offers
                    </span>
                    {offerCounts.received > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-medium">
                        {offerCounts.received}
                      </span>
                    )}
                  </Link>
                  <div className="border-t border-gray-100" />
                  <Link
                    to="/vendor/offers/sent"
                    onClick={() => setShowOfferMenu(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Sent Offers
                    </span>
                    {offerCounts.sent > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-medium">
                        {offerCounts.sent}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            {/* Notifications Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleToggleNotifications}
                className="relative p-1 hover:text-gray-300 transition-colors"
                title="Notifications"
              >
                <Bell className={`w-5 h-5 ${unreadNotificationCount > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 min-w-[16px] px-0.5 flex items-center justify-center animate-pulse">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotificationPanel && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-teal-100 hover:text-white flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Bell className="w-10 h-10 mb-2 text-gray-300" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-gray-100">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Link
                      to="/vendor/notifications"
                      onClick={() => setShowNotificationPanel(false)}
                      className="block text-center py-3 text-sm text-teal-600 hover:bg-teal-50 font-medium border-t border-gray-100"
                    >
                      View All Notifications
                    </Link>
                  )}
                </div>
              )}
            </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedSubHeader