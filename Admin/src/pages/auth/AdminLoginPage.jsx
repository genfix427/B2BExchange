import React from 'react'
import { Link } from 'react-router-dom'
import AdminLoginForm from '../../components/auth/AdminLoginForm'
import { Shield } from 'lucide-react'

const AdminLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Medical Marketplace</h2>
              <p className="text-sm text-gray-600">Administrator Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AdminLoginForm />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Medical Marketplace. All rights reserved.
            <br />
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage