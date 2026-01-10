import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiLogOut, FiHome } from 'react-icons/fi'
import { MdDashboard, MdPerson } from 'react-icons/md'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { Building2 } from 'lucide-react'

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userDropdownOpen])

  const navClass = ({ isActive }) =>
    `transition-colors ${isActive
      ? 'text-teal-600 font-semibold border-b-2 border-teal-600'
      : 'text-gray-700 hover:text-teal-600'
    }`

  const mobileNavClass = ({ isActive }) =>
    `block py-2 border-b transition ${isActive
      ? 'text-teal-600 font-semibold'
      : 'text-gray-700 hover:text-teal-600'
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

  // Get first letter of pharmacy name or email
  const getUserInitial = () => {
    if (!user) return 'U'

    // Try to get pharmacy name from multiple possible locations
    const pharmacyName = user.pharmacyInfo?.legalBusinessName ||
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

  // Get full pharmacy name
  const getPharmacyName = () => {
    if (!user) return ''

    const pharmacyName = user.pharmacyInfo?.legalBusinessName ||
      user.businessName ||
      user.legalBusinessName

    if (pharmacyName) {
      return pharmacyName.length > 20 ? pharmacyName.substring(0, 20) + '...' : pharmacyName
    }

    return user.email ? user.email.split('@')[0] : ''
  }

  // Get user email
  const getUserEmail = () => {
    return user?.email || ''
  }

  // Show loading skeleton
  if (authLoading) {
    return (
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </NavLink>
            <div className="hidden lg:flex gap-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-teal-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medical Marketplace</h1>
              <p className="text-xs text-gray-600">B2B Pharmaceutical Platform</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium">
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
                className={navClass}
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative user-dropdown">
                {/* User Avatar and Name */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Avatar Circle with Initial */}
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-lg">
                    {getUserInitial()}
                  </div>

                  {/* Pharmacy Name */}
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">
                      {getPharmacyName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.status === 'approved' ? 'Active Vendor' :
                        user.status === 'pending' ? 'Pending Approval' :
                          user.status === 'rejected' ? 'Rejected' : 'Vendor'}
                    </p>
                  </div>

                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">
                        {getPharmacyName()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {getUserEmail()}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.status === 'approved' ? 'bg-green-100 text-green-800' :
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {user.status === 'approved' ? '✓ Approved' :
                            user.status === 'pending' ? '⏳ Pending' :
                              user.status === 'rejected' ? '✗ Rejected' :
                                user.status}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    {user.status === 'approved' && (
                      <NavLink
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <MdDashboard className="w-5 h-5 text-gray-400" />
                        <span>Dashboard</span>
                      </NavLink>
                    )}

                    <NavLink
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <MdPerson className="w-5 h-5 text-gray-400" />
                      <span>Profile Settings</span>
                    </NavLink>

                    <NavLink
                      to="/"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiHome className="w-5 h-5 text-gray-400" />
                      <span>Home</span>
                    </NavLink>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Admin Panel Link for admins */}
                    {user.role === 'admin' && (
                      <a
                        href="http://localhost:5174/admin/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Admin Panel</span>
                      </a>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login/Register buttons for non-logged in users
              <div className="flex gap-3">
                <NavLink
                  to="/login"
                  className="px-4 py-1.5 rounded-md border border-teal-600 text-teal-600 hover:bg-teal-50 transition"
                >
                  Log In
                </NavLink>

                <NavLink
                  to="/register"
                  className="px-4 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-gray-700"
            aria-label="Toggle Menu"
          >
            {open ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 pb-4 space-y-3 bg-white">
          {/* Navigation Links */}
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
              end={item.path === '/'}
              onClick={() => setOpen(false)}
              className={mobileNavClass}
            >
              {item.label}
            </NavLink>
          ))}

          {/* User Info for Mobile (if logged in) */}
          {user && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-lg">
                  {getUserInitial()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {getPharmacyName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getUserEmail()}
                  </p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.status === 'approved' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {user.status === 'approved' ? '✓ Approved' :
                        user.status === 'pending' ? '⏳ Pending' :
                          user.status === 'rejected' ? '✗ Rejected' :
                            user.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {user.status === 'approved' && (
                  <NavLink
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <MdDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </NavLink>
                )}

                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  <MdPerson className="w-5 h-5" />
                  <span>Profile Settings</span>
                </NavLink>

                {user.role === 'admin' && (
                  <a
                    href="http://localhost:5174/admin/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Admin Panel</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    handleLogout()
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Login/Register for Mobile (if not logged in) */}
          {!user && (
            <div className="flex gap-3 pt-3">
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2 rounded-md border border-teal-600 text-teal-600"
              >
                Log In
              </NavLink>

              <NavLink
                to="/register"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2 rounded-md bg-teal-600 text-white"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}