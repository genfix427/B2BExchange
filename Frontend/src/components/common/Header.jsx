import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiLogOut, FiHome } from 'react-icons/fi'
import { MdDashboard, MdPerson } from 'react-icons/md'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, isLoading: authLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userDropdownOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const navClass = ({ isActive }) =>
    `relative py-1 transition-colors duration-200 ${
      isActive
        ? 'text-[#9155a7] font-semibold'
        : 'text-gray-700 hover:text-[#9155a7]'
    }`

  const mobileNavClass = ({ isActive }) =>
    `flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-[#9155a7]/10 text-[#9155a7] font-semibold'
        : 'text-gray-700 hover:bg-[#9155a7]/5 hover:text-[#9155a7]'
    }`

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      setUserDropdownOpen(false)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitial = () => {
    if (!user) return 'U'
    const pharmacyName =
      user.pharmacyInfo?.legalBusinessName ||
      user.businessName ||
      user.legalBusinessName
    if (pharmacyName && pharmacyName.length > 0) {
      return pharmacyName.charAt(0).toUpperCase()
    }
    if (user.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getPharmacyName = () => {
    if (!user) return ''
    const pharmacyName =
      user.pharmacyInfo?.legalBusinessName ||
      user.businessName ||
      user.legalBusinessName
    if (pharmacyName) {
      return pharmacyName.length > 20
        ? pharmacyName.substring(0, 20) + '...'
        : pharmacyName
    }
    return user.email ? user.email.split('@')[0] : ''
  }

  const getUserEmail = () => {
    return user?.email || ''
  }

  // Loading skeleton
  if (authLoading) {
    return (
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#9155a7]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#9155a7]/10 rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-1" />
              </div>
            </div>
            <div className="hidden lg:flex gap-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="w-16 h-5 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
            <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-[#9155a7]/5 border-b border-[#9155a7]/10'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9155a7] to-[#a42574] flex items-center justify-center shadow-md shadow-[#9155a7]/20 group-hover:shadow-lg group-hover:shadow-[#9155a7]/30 transition-all duration-300">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                {/* Pulse dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#a42574] rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#111111] tracking-tight group-hover:text-[#9155a7] transition-colors duration-300">
                  MedMarket
                </h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                  B2B Pharma Platform
                </p>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-1 text-sm font-medium">
              {[
                { label: 'Home', path: '/' },
                { label: 'How it works', path: '/how-it-works' },
                { label: 'Testimonials', path: '/testimonials' },
                { label: "FAQ's", path: '/faqs' },
                { label: 'Shipping', path: '/shipping' },
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-[#9155a7] font-semibold bg-[#9155a7]/5'
                        : 'text-gray-600 hover:text-[#9155a7] hover:bg-[#9155a7]/5'
                    }`
                  }
                  end={item.path === '/'}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-[#9155a7] to-[#a42574] rounded-full"
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      userDropdownOpen
                        ? 'bg-[#9155a7]/10 ring-1 ring-[#9155a7]/20'
                        : 'hover:bg-[#9155a7]/5'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9155a7] to-[#a42574] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#9155a7]/20">
                      {getUserInitial()}
                    </div>

                    <div className="text-left">
                      <p className="font-semibold text-[#111111] text-sm leading-tight">
                        {getPharmacyName()}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {user.status === 'approved'
                          ? '● Active Vendor'
                          : user.status === 'pending'
                          ? '◐ Pending'
                          : user.status === 'rejected'
                          ? '○ Rejected'
                          : 'Vendor'}
                      </p>
                    </div>

                    <motion.svg
                      animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-[#9155a7]/10 border border-[#9155a7]/10 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="px-5 py-4 bg-gradient-to-br from-[#9155a7]/5 to-[#a42574]/5 border-b border-[#9155a7]/10">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#9155a7] to-[#a42574] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#9155a7]/20">
                              {getUserInitial()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#111111] text-sm truncate">
                                {getPharmacyName()}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {getUserEmail()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                user.status === 'approved'
                                  ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                  : user.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                                  : user.status === 'rejected'
                                  ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === 'approved'
                                    ? 'bg-green-500'
                                    : user.status === 'pending'
                                    ? 'bg-amber-500 animate-pulse'
                                    : user.status === 'rejected'
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                                }`}
                              />
                              {user.status === 'approved'
                                ? 'Approved'
                                : user.status === 'pending'
                                ? 'Pending Approval'
                                : user.status === 'rejected'
                                ? 'Rejected'
                                : user.status}
                            </span>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {user.status === 'approved' && (
                            <NavLink
                              to="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-[#9155a7]/5 hover:text-[#9155a7] transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#9155a7]/10 flex items-center justify-center group-hover:bg-[#9155a7]/20 transition-colors">
                                <MdDashboard className="w-4 h-4 text-[#9155a7]" />
                              </div>
                              <span>Dashboard</span>
                            </NavLink>
                          )}

                          <NavLink
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-[#9155a7]/5 hover:text-[#9155a7] transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#9155a7]/10 flex items-center justify-center group-hover:bg-[#9155a7]/20 transition-colors">
                              <MdPerson className="w-4 h-4 text-[#9155a7]" />
                            </div>
                            <span>Profile Settings</span>
                          </NavLink>

                          <NavLink
                            to="/"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-[#9155a7]/5 hover:text-[#9155a7] transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#9155a7]/10 flex items-center justify-center group-hover:bg-[#9155a7]/20 transition-colors">
                              <FiHome className="w-4 h-4 text-[#9155a7]" />
                            </div>
                            <span>Home</span>
                          </NavLink>

                          {/* Admin Panel */}
                          {user.role === 'admin' && (
                            <>
                              <div className="mx-5 my-1 h-px bg-[#9155a7]/10" />
                              <a
                                href="http://localhost:5174/admin/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#7b2c78] hover:bg-[#7b2c78]/5 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#7b2c78]/10 flex items-center justify-center group-hover:bg-[#7b2c78]/20 transition-colors">
                                  <svg
                                    className="w-4 h-4 text-[#7b2c78]"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <span>Admin Panel</span>
                                <svg
                                  className="w-3 h-3 ml-auto text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-[#9155a7]/10 p-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <FiLogOut className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <NavLink
                    to="/login"
                    className="px-5 py-2 rounded-xl border-2 border-[#9155a7] text-[#9155a7] font-semibold text-sm hover:bg-[#9155a7]/5 transition-all duration-200"
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#9155a7] to-[#a42574] text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#9155a7]/25 transition-all duration-300"
                  >
                    Register
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#9155a7]/5 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FiX size={24} className="text-[#9155a7]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FiMenu size={24} className="text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay & Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl shadow-[#9155a7]/10 overflow-y-auto"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#9155a7]/10">
                <NavLink
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9155a7] to-[#a42574] flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-[#111111]">MedMarket</span>
                </NavLink>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-xl bg-[#9155a7]/10 flex items-center justify-center cursor-pointer"
                >
                  <FiX size={20} className="text-[#9155a7]" />
                </button>
              </div>

              {/* User Info (if logged in) */}
              {user && (
                <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#9155a7]/5 to-[#a42574]/5 border border-[#9155a7]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9155a7] to-[#a42574] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#9155a7]/20">
                      {getUserInitial()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#111111] text-sm truncate">
                        {getPharmacyName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {getUserEmail()}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          user.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : user.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : user.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'approved'
                              ? 'bg-green-500'
                              : user.status === 'pending'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-red-500'
                          }`}
                        />
                        {user.status === 'approved'
                          ? 'Approved'
                          : user.status === 'pending'
                          ? 'Pending'
                          : user.status === 'rejected'
                          ? 'Rejected'
                          : user.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-4 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">
                  Navigation
                </p>
                {[
                  { label: 'Home', path: '/' },
                  { label: 'How it works', path: '/how-it-works' },
                  { label: 'Testimonials', path: '/testimonials' },
                  { label: "FAQ's", path: '/faqs' },
                  { label: 'Shipping', path: '/shipping' },
                  { label: 'About', path: '/about' },
                  { label: 'Contact', path: '/contact' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setOpen(false)}
                      className={mobileNavClass}
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              {/* User Actions (if logged in) */}
              {user && (
                <div className="p-4 border-t border-[#9155a7]/10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">
                    Account
                  </p>
                  <div className="space-y-1">
                    {user.status === 'approved' && (
                      <NavLink
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#9155a7]/5 text-gray-700 hover:text-[#9155a7] transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#9155a7]/10 flex items-center justify-center">
                          <MdDashboard className="w-4 h-4 text-[#9155a7]" />
                        </div>
                        <span className="text-sm font-medium">Dashboard</span>
                      </NavLink>
                    )}

                    <NavLink
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#9155a7]/5 text-gray-700 hover:text-[#9155a7] transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#9155a7]/10 flex items-center justify-center">
                        <MdPerson className="w-4 h-4 text-[#9155a7]" />
                      </div>
                      <span className="text-sm font-medium">
                        Profile Settings
                      </span>
                    </NavLink>

                    {user.role === 'admin' && (
                      <a
                        href="http://localhost:5174/admin/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#7b2c78]/5 text-[#7b2c78] transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#7b2c78]/10 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-[#7b2c78]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium">
                          Admin Panel
                        </span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        handleLogout()
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 w-full py-3 px-4 rounded-xl hover:bg-red-50 text-red-600 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Login/Register (if not logged in) */}
              {!user && (
                <div className="p-4 border-t border-[#9155a7]/10">
                  <div className="flex flex-col gap-2.5">
                    <NavLink
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="w-full text-center py-3 rounded-xl border-2 border-[#9155a7] text-[#9155a7] font-semibold text-sm hover:bg-[#9155a7]/5 transition-all"
                    >
                      Log In
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#9155a7] to-[#a42574] text-white font-semibold text-sm shadow-lg shadow-[#9155a7]/20"
                    >
                      Register
                    </NavLink>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}