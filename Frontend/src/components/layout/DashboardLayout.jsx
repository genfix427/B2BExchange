import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import {
  Home,
  Package,
  DollarSign,
  MessageSquare,
  Settings,
  User,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Building2,
  BarChart3,
  FileText
} from 'lucide-react'

const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/orders', icon: FileText, label: 'Orders' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <SidebarContent 
                navItems={navItems} 
                user={user} 
                onLogout={handleLogout} 
              />
            </div>
            <div className="flex-shrink-0 w-14" />
          </div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <SidebarContent 
              navItems={navItems} 
              user={user} 
              onLogout={handleLogout} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full md:ml-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search products, orders, etc."
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    3
                  </span>
                </div>
              </button>
              
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.pharmacyInfo?.legalBusinessName}
                    </p>
                    <p className="text-xs text-gray-500">Vendor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navItems, user, onLogout }) => (
  <>
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-900">Medical Marketplace</h1>
          <p className="text-xs text-gray-600">Vendor Portal</p>
        </div>
      </div>
      
      {/* Vendor Info */}
      <div className="mt-6 px-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.pharmacyInfo?.legalBusinessName}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {user?.pharmacyInfo?.npiNumber}
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              user?.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
    
    {/* Logout */}
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <button
        onClick={onLogout}
        className="flex-shrink-0 w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
        Sign out
      </button>
    </div>
  </>
)

export default DashboardLayout