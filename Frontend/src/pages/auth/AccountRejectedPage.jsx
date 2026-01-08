import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { XCircle, Mail, Phone } from 'lucide-react'

const AccountRejectedPage = () => {
  const location = useLocation()
  const rejectionReason = location.state?.reason || 'Your application did not meet our requirements.'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-red-100 rounded-full">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Not Approved
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your vendor application has been reviewed and rejected.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Reason for rejection:</strong> {rejectionReason}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">What does this mean?</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Your vendor account cannot access the platform</li>
                <li>You will not be able to list products or make sales</li>
                <li>All submitted data has been archived</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Next Steps</h3>
              <p className="text-gray-600 mb-3">
                If you believe this is a mistake or would like to appeal the decision:
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
              <div className="flex space-x-3">
                <Link
                  to="/"
                  className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Return to Home
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountRejectedPage