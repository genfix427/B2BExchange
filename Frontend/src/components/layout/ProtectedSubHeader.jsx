// src/components/layout/ProtectedSubHeader.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  CheckCheck,
  ArrowRight,
  DollarSign,
  X,
  Clock,
  Check,
  Gift,
  ShoppingBag,
} from 'lucide-react'
import {
  fetchCart,
  fetchWishlist,
  selectCartItemCount,
  selectWishlistCount,
} from '../../store/slices/storeSlice'
import {
  fetchOfferStats,
  selectOfferCounts,
} from '../../store/slices/offerSlice'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectUnreadCount,
  selectNotifications,
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
  const offerTimeoutRef = useRef(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
      dispatch(fetchOfferStats())
      dispatch(fetchUnreadCount())
    }
  }, [dispatch, user, location.pathname])

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
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotificationPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (offerTimeoutRef.current) {
        clearTimeout(offerTimeoutRef.current)
      }
    }
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
    if (
      notification.type.includes('offer') ||
      notification.type.includes('counter')
    ) {
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

  // Offer menu hover handlers with delay
  const handleOfferMouseEnter = () => {
    if (offerTimeoutRef.current) {
      clearTimeout(offerTimeoutRef.current)
      offerTimeoutRef.current = null
    }
    setShowOfferMenu(true)
    setShowNotificationPanel(false)
  }

  const handleOfferMouseLeave = () => {
    offerTimeoutRef.current = setTimeout(() => {
      setShowOfferMenu(false)
    }, 200)
  }

  const handleOfferClick = () => {
    setShowOfferMenu((prev) => !prev)
    setShowNotificationPanel(false)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'offer_received':
        return <Gift className="w-4 h-4 text-[#9155a7]" />
      case 'offer_accepted':
      case 'counter_accepted':
        return <Check className="w-4 h-4 text-green-500" />
      case 'offer_rejected':
      case 'counter_rejected':
        return <X className="w-4 h-4 text-red-500" />
      case 'offer_countered':
        return <DollarSign className="w-4 h-4 text-[#a42574]" />
      case 'order_created':
      case 'new_order':
        return <ShoppingBag className="w-4 h-4 text-[#7b2c78]" />
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

  const isActive = (path) => location.pathname === path
  const isActiveIncludes = (path) => location.pathname.includes(path)

  return (
    <div className="bg-gradient-to-r from-[#2d1233] via-[#3a1940] to-[#2d1233] text-white mt-16 border-b border-[#9155a7]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Left Navigation */}
          <div className="flex items-center">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {[
                {
                  to: '/vendor/dashboard',
                  icon: <Home className="w-3.5 h-3.5" />,
                  label: 'Dashboard',
                  active: isActive('/vendor/dashboard'),
                },
                {
                  to: '/store',
                  icon: <Store className="w-3.5 h-3.5" />,
                  label: 'Marketplace',
                  active: isActive('/store'),
                },
                {
                  to: '/vendor/products',
                  icon: <Package className="w-3.5 h-3.5" />,
                  label: 'My Products',
                  active: isActiveIncludes('/vendor/products'),
                },
                {
                  to: '/vendor/orders',
                  icon: <BarChart3 className="w-3.5 h-3.5" />,
                  label: 'Sales Orders',
                  active: isActive('/vendor/orders'),
                },
                {
                  to: '/store/orders',
                  icon: <Package className="w-3.5 h-3.5" />,
                  label: 'My Purchases',
                  active: isActiveIncludes('/store/orders'),
                },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    item.active
                      ? 'bg-white/15 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}

              {/* ===== FIXED OFFERS DROPDOWN ===== */}
              <div
                className="relative"
                ref={offerMenuRef}
                onMouseEnter={handleOfferMouseEnter}
                onMouseLeave={handleOfferMouseLeave}
              >
                <button
                  onClick={handleOfferClick}
                  className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActiveIncludes('/vendor/offers') || showOfferMenu
                      ? 'bg-white/15 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offers</span>
                  {offerCounts.total > 0 && (
                    <span className="bg-[#a42574] text-white text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-bold">
                      {offerCounts.total}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: showOfferMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showOfferMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 pt-1 z-50"
                    >
                      {/* Invisible bridge to prevent gap hover loss */}
                      <div className="absolute -top-1 left-0 right-0 h-2" />

                      <div className="w-60 bg-white rounded-xl shadow-2xl shadow-[#9155a7]/15 border border-[#9155a7]/10 overflow-hidden">
                        <Link
                          to="/vendor/offers/received"
                          onClick={() => setShowOfferMenu(false)}
                          className="flex items-center justify-between px-4 py-3.5 text-sm text-gray-700 hover:bg-[#9155a7]/5 hover:text-[#9155a7] transition-all duration-200 group"
                        >
                          <span className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#9155a7]/10 flex items-center justify-center group-hover:bg-[#9155a7]/20 transition-colors">
                              <Gift className="w-3.5 h-3.5 text-[#9155a7]" />
                            </div>
                            Received Offers
                          </span>
                          {offerCounts.received > 0 && (
                            <span className="bg-[#a42574] text-white text-[10px] rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold">
                              {offerCounts.received}
                            </span>
                          )}
                        </Link>
                        <div className="h-px bg-[#9155a7]/10 mx-3" />
                        <Link
                          to="/vendor/offers/sent"
                          onClick={() => setShowOfferMenu(false)}
                          className="flex items-center justify-between px-4 py-3.5 text-sm text-gray-700 hover:bg-[#9155a7]/5 hover:text-[#9155a7] transition-all duration-200 group"
                        >
                          <span className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#7b2c78]/10 flex items-center justify-center group-hover:bg-[#7b2c78]/20 transition-colors">
                              <ArrowRight className="w-3.5 h-3.5 text-[#7b2c78]" />
                            </div>
                            Sent Offers
                          </span>
                          {offerCounts.sent > 0 && (
                            <span className="bg-[#7b2c78] text-white text-[10px] rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold">
                              {offerCounts.sent}
                            </span>
                          )}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* ===== END FIXED OFFERS ===== */}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleToggleNotifications}
                className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  showNotificationPanel
                    ? 'bg-white/15 text-white'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
                title="Notifications"
              >
                <Bell
                  className={`w-4 h-4 ${
                    unreadNotificationCount > 0
                      ? 'text-[#d4a5d4]'
                      : 'text-gray-300'
                  }`}
                />
                {unreadNotificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#a42574] text-white text-[10px] rounded-full h-4 min-w-[16px] px-0.5 flex items-center justify-center font-bold ring-2 ring-[#2d1233]"
                  >
                    {unreadNotificationCount > 99
                      ? '99+'
                      : unreadNotificationCount}
                  </motion.span>
                )}
              </button>

              {/* Notification Panel */}
              <AnimatePresence>
                {showNotificationPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl shadow-[#9155a7]/15 border border-[#9155a7]/10 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#9155a7] to-[#a42574] text-white">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadNotificationCount > 0 && (
                          <span className="bg-white/20 text-white text-[10px] rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold">
                            {unreadNotificationCount}
                          </span>
                        )}
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-white/80 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <div className="w-14 h-14 rounded-2xl bg-[#9155a7]/10 flex items-center justify-center mb-3">
                            <Bell className="w-7 h-7 text-[#9155a7]/40" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">
                            No notifications yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            We'll notify you when something arrives
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <motion.button
                            key={notification._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`w-full text-left px-5 py-3.5 border-b border-gray-100/80 hover:bg-[#9155a7]/3 transition-all duration-200 cursor-pointer ${
                              !notification.isRead ? 'bg-[#9155a7]/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                                  !notification.isRead
                                    ? 'bg-[#9155a7]/10'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p
                                    className={`text-sm leading-tight ${
                                      !notification.isRead
                                        ? 'font-bold text-[#111111]'
                                        : 'font-medium text-gray-700'
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-[#a42574] rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                  {notification.message}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <Link
                        to="/vendor/notifications"
                        onClick={() => setShowNotificationPanel(false)}
                        className="flex items-center justify-center gap-2 py-3.5 text-sm text-[#9155a7] hover:bg-[#9155a7]/5 font-semibold border-t border-[#9155a7]/10 transition-all duration-200"
                      >
                        View All Notifications
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group"
              title="Wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  wishlistCount > 0
                    ? 'fill-[#a42574] text-[#a42574]'
                    : 'text-gray-300 group-hover:text-white'
                }`}
              />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-[#a42574] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold ring-2 ring-[#2d1233]"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={handleToggleCart}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group"
              title="Cart"
            >
              <ShoppingCart className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-[#9155a7] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold ring-2 ring-[#2d1233]"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedSubHeader