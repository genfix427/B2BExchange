import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { updateFormData, nextStep, prevStep } from '../../../store/slices/registrationSlice'
import { REFERRAL_SOURCES } from '../../../utils/constants'
import { Info } from 'lucide-react'

const Step6ReferralInfo = () => {
  const dispatch = useDispatch()
  const { formData } = useSelector((state) => state.registration)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.referralInfo || {}
  })
  
  const [termsAccepted, setTermsAccepted] = useState(
    formData.referralInfo?.termsAccepted || false
  )
  
  const onSubmit = (data) => {
    if (!termsAccepted) {
      alert('You must accept the Terms & Conditions to continue.')
      return
    }
    
    const referralData = {
      ...data,
      termsAccepted: true
    }
    
    dispatch(updateFormData({
      step: 6,
      data: referralData
    }))
    dispatch(nextStep())
  }
  
  const handleBack = () => {
    dispatch(prevStep())
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 6: Referral Information & Terms</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Promo Code (Optional)
          </label>
          <input
            type="text"
            {...register('promoCode')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter promo code if you have one"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How did you hear about us? *
          </label>
          <select
            {...register('referralSource', {
              required: 'Please tell us how you heard about us'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Source</option>
            {REFERRAL_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
          {errors.referralSource && (
            <p className="mt-1 text-sm text-red-600">{errors.referralSource.message}</p>
          )}
        </div>
        
        {/* Terms & Conditions */}
        <div className="border-t pt-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto p-4 bg-white rounded border">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. Vendor Agreement</h4>
                <p className="text-sm text-gray-600">
                  By registering as a vendor on Medical Marketplace, you agree to comply with all 
                  applicable federal, state, and local laws and regulations governing pharmaceutical 
                  distribution and sales.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. License Verification</h4>
                <p className="text-sm text-gray-600">
                  You certify that all provided licenses (DEA, State Pharmacy, Business) are current, 
                  valid, and in good standing. You agree to promptly notify us of any changes to your 
                  licensing status.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. Compliance Requirements</h4>
                <p className="text-sm text-gray-600">
                  All vendors must maintain compliance with PDMP requirements, controlled substance 
                  regulations, and maintain proper documentation for all transactions.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">4. Data Accuracy</h4>
                <p className="text-sm text-gray-600">
                  You certify that all information provided during registration is accurate and complete. 
                  Providing false information may result in immediate termination of your account.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">5. Platform Usage</h4>
                <p className="text-sm text-gray-600">
                  You agree to use the platform only for legitimate B2B pharmaceutical transactions 
                  and to maintain professional conduct in all communications.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">6. Fee Structure</h4>
                <p className="text-sm text-gray-600">
                  You acknowledge and agree to the platform's transaction fee structure as outlined 
                  in the separate fee schedule document.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">7. Privacy Policy</h4>
                <p className="text-sm text-gray-600">
                  You agree to our Privacy Policy regarding the collection, use, and protection of 
                  your business information.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="terms" className="text-sm font-medium text-gray-700">
                    I have read and agree to the Terms & Conditions *
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    You must accept the Terms & Conditions to complete your registration.
                  </p>
                </div>
              </div>
              
              {!termsAccepted && (
                <div className="mt-3 flex items-center text-amber-600 text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>You must accept the Terms & Conditions to proceed</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next: Document Upload & Account
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step6ReferralInfo