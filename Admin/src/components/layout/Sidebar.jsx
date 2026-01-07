import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { 
  Home, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react'

const Sidebar = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  const handleLogout = () => {
    dispatch(logout())
  }
  
  // Sidebar.js - Update navItems
const navItems = [
  { to: 'dashboard', icon: Home, label: 'Dashboard' },
  { to: 'vendors/pending', icon: FileCheck, label: 'Pending Approvals' },
  { to: 'vendors', icon: Users, label: 'Vendor Management' },
  { to: 'analytics', icon: BarChart3, label: 'Analytics' },
  { to: 'settings', icon: Settings, label: 'Settings' },
]
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <Building2 className="h-8 w-8 text-white" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">Medical Marketplace</h1>
                <p className="text-xs text-gray-300">Admin Panel</p>
              </div>
            </div>
            
            {/* Admin Info */}
            <div className="mt-6 px-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Role: {user?.role?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-6 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white">
                    Sign out
                  </p>
                </div>
                <div className="ml-auto">
                  <LogOut className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar