import React from 'react'
import { useSelector } from 'react-redux'
import { Clock, Mail, Phone, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const PendingApprovalPage = () => {
  const { user } = useSelector((state) => state.auth)
  
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
              <p className="text-sm text-gray-600">B2B Pharmaceutical Platform</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            
            <h3 className="mt-4 text-2xl font-bold text-gray-900">
              Application Under Review
            </h3>
            
            <p className="mt-3 text-gray-600">
              Thank you for registering with Medical Marketplace. Your application is currently 
              being reviewed by our admin team.
            </p>
            
            {user?.pharmacyInfo && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Application Details</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.pharmacyInfo.legalBusinessName}
                      </p>
                      <p className="text-sm text-gray-500">
                        NPI#: {user.pharmacyInfo.npiNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">
                        {user.pharmacyOwner.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">
                        {user.pharmacyInfo.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>What happens next?</strong>
                <br />
                Our team will verify your documents and credentials. This process typically 
                takes 24-48 hours. You will receive an email notification once your account 
                has been approved.
              </p>
            </div>
            
            <div className="mt-8">
              <div className="text-sm text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@medicalmarketplace.com" className="font-medium text-blue-600 hover:text-blue-500">
                  support@medicalmarketplace.com
                </a>
              </div>
              
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovalPage