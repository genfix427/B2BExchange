import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import RegistrationStepper from '../../components/auth/Registration/RegistrationStepper'
import Step1PharmacyInfo from '../../components/auth/Registration/Step1PharmacyInfo'
import Step2PharmacyOwner from '../../components/auth/Registration/Step2PharmacyOwner'
import Step3PrimaryContact from '../../components/auth/Registration/Step3PrimaryContact'
import Step4PharmacyLicense from '../../components/auth/Registration/Step4PharmacyLicense'
import Step5PharmacyQuestions from '../../components/auth/Registration/Step5PharmacyQuestions'
import Step6ReferralInfo from '../../components/auth/Registration/Step6ReferralInfo'
import Step7BankAccount from '../../components/auth/Registration/Step7BankAccount'
import Step8DocumentUpload from '../../components/auth/Registration/Step8DocumentUpload'
import { Building2, CheckCircle } from 'lucide-react'

const RegisterPage = () => {
  const { currentStep, registrationComplete, registrationId } = useSelector((state) => state.registration)
  
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return <Step1PharmacyInfo />
      case 2:
        return <Step2PharmacyOwner />
      case 3:
        return <Step3PrimaryContact />
      case 4:
        return <Step4PharmacyLicense />
      case 5:
        return <Step5PharmacyQuestions />
      case 6:
        return <Step6ReferralInfo />
      case 7:
        return <Step7BankAccount />
      case 8:
        return <Step8DocumentUpload />
      default:
        return <Step1PharmacyInfo />
    }
  }
  
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
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
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Submitted!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Thank you for registering with Medical Marketplace. Your application has been received and is currently under review.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Application ID:</strong> {registrationId}<br />
                  <strong>Status:</strong> Pending Admin Approval
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="text-left bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Our team will verify your documents and credentials</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>This process typically takes 24-48 hours</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You will receive an email notification once your account is approved</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Need to make changes to your application? Contact our support team.
                  </p>
                  
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Medical Marketplace</h1>
                <p className="text-sm text-gray-600">Vendor Registration</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of 8
            </div>
          </div>
        </div>
      </div>
      
      {/* Stepper */}
      <RegistrationStepper />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          {renderStep()}
        </div>
        
        {/* Help Section */}
        {currentStep === 1 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-3">Need Help?</h4>
            <p className="text-sm text-blue-700 mb-2">
              For assistance with registration or questions about required documents, contact our support team:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>📞 Support: 1-800-123-4567</li>
              <li>✉️ Email: support@medicalmarketplace.com</li>
              <li>⏰ Hours: Monday-Friday, 9AM-6PM EST</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegisterPage