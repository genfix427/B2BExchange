import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle, Mail, Phone } from 'lucide-react'

const AccountSuspendedPage = () => {
  const location = useLocation()
  const suspensionReason = location.state?.reason || 'Your account has been suspended due to policy violations.'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Suspended
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your vendor account has been temporarily suspended.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Suspension reason:</strong> {suspensionReason}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Restrictions</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>You cannot access vendor dashboard</li>
                <li>Your products are hidden from customers</li>
                <li>Pending orders are on hold</li>
                <li>Withdrawals are temporarily disabled</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">To Reactivate Your Account</h3>
              <p className="text-gray-600 mb-3">
                Please contact our support team to resolve this issue:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-500">support@medicalmarketplace.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Call Support</p>
                    <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSuspendedPage