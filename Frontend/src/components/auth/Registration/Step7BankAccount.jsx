import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Banknote, Shield, Lock, Building } from 'lucide-react'
import { updateFormData, nextStep, prevStep } from '../../../store/slices/registrationSlice'

const Step7BankAccount = () => {
  const dispatch = useDispatch()
  const { formData } = useSelector((state) => state.registration)
  
  const [bankData, setBankData] = useState({
    accountHolderName: formData.bankAccount?.accountHolderName || '',
    bankName: formData.bankAccount?.bankName || '',
    accountType: formData.bankAccount?.accountType || 'Checking',
    routingNumber: formData.bankAccount?.routingNumber || '',
    accountNumber: formData.bankAccount?.accountNumber || '',
    confirmationAccountNumber: formData.bankAccount?.confirmationAccountNumber || '',
    bankAddress: {
      line1: formData.bankAccount?.bankAddress?.line1 || '',
      line2: formData.bankAccount?.bankAddress?.line2 || '',
      city: formData.bankAccount?.bankAddress?.city || '',
      state: formData.bankAccount?.bankAddress?.state || '',
      zipCode: formData.bankAccount?.bankAddress?.zipCode || ''
    },
    bankPhone: formData.bankAccount?.bankPhone || '',
    achAuthorization: formData.bankAccount?.achAuthorization || false
  })
  
  const [errors, setErrors] = useState({})
  
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]
  
  const accountTypes = ['Checking', 'Savings', 'Business Checking', 'Business Savings']
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!bankData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }
    
    if (!bankData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    }
    
    if (!bankData.routingNumber.trim()) {
      newErrors.routingNumber = 'Routing number is required'
    } else if (!/^\d{9}$/.test(bankData.routingNumber)) {
      newErrors.routingNumber = 'Routing number must be exactly 9 digits'
    }
    
    if (!bankData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    } else if (!/^\d{10,17}$/.test(bankData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10-17 digits'
    }
    
    if (!bankData.confirmationAccountNumber.trim()) {
      newErrors.confirmationAccountNumber = 'Please confirm account number'
    } else if (bankData.accountNumber !== bankData.confirmationAccountNumber) {
      newErrors.confirmationAccountNumber = 'Account numbers do not match'
    }
    
    if (!bankData.bankAddress.line1.trim()) {
      newErrors['bankAddress.line1'] = 'Bank address is required'
    }
    
    if (!bankData.bankAddress.city.trim()) {
      newErrors['bankAddress.city'] = 'City is required'
    }
    
    if (!bankData.bankAddress.state) {
      newErrors['bankAddress.state'] = 'State is required'
    }
    
    if (!bankData.bankAddress.zipCode.trim()) {
      newErrors['bankAddress.zipCode'] = 'Zip code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(bankData.bankAddress.zipCode)) {
      newErrors['bankAddress.zipCode'] = 'Invalid zip code format'
    }
    
    if (!bankData.bankPhone.trim()) {
      newErrors.bankPhone = 'Bank phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(bankData.bankPhone)) {
      newErrors.bankPhone = 'Invalid phone number'
    }
    
    if (!bankData.achAuthorization) {
      newErrors.achAuthorization = 'You must authorize ACH transactions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNext = () => {
    if (!validateForm()) {
      return
    }
    
    dispatch(updateFormData({
      step: 7,
      data: bankData
    }))
    dispatch(nextStep())
  }
  
  const handleBack = () => {
    dispatch(updateFormData({
      step: 7,
      data: bankData
    }))
    dispatch(prevStep())
  }
  
  const handleInputChange = (field, value) => {
    setBankData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleAddressChange = (field, value) => {
    setBankData(prev => ({
      ...prev,
      bankAddress: {
        ...prev.bankAddress,
        [field]: value
      }
    }))
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 7: Bank Account Details</h2>
      
      <div className="space-y-8">
        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Secure Information</h4>
              <p className="text-sm text-blue-700">
                Your bank account information is encrypted and stored securely. This information is used solely for processing payments.
              </p>
            </div>
          </div>
        </div>
        
        {/* Account Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={bankData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.accountHolderName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="John Smith"
              />
              {errors.accountHolderName && (
                <p className="mt-1 text-sm text-red-600">{errors.accountHolderName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                value={bankData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.bankName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Chase Bank"
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <select
                value={bankData.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number *
              </label>
              <input
                type="text"
                value={bankData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value.replace(/\D/g, ''))}
                maxLength={9}
                className={`w-full px-3 py-2 border ${errors.routingNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="9-digit routing number"
              />
              {errors.routingNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="password"
                value={bankData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="10-17 digit account number"
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Account Number *
              </label>
              <input
                type="password"
                value={bankData.confirmationAccountNumber}
                onChange={(e) => handleInputChange('confirmationAccountNumber', e.target.value.replace(/\D/g, ''))}
                className={`w-full px-3 py-2 border ${errors.confirmationAccountNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Confirm account number"
              />
              {errors.confirmationAccountNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmationAccountNumber}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Bank Address */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Bank Address</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={bankData.bankAddress.line1}
                onChange={(e) => handleAddressChange('line1', e.target.value)}
                className={`w-full px-3 py-2 border ${errors['bankAddress.line1'] ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="123 Main St"
              />
              {errors['bankAddress.line1'] && (
                <p className="mt-1 text-sm text-red-600">{errors['bankAddress.line1']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={bankData.bankAddress.line2}
                onChange={(e) => handleAddressChange('line2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Suite 100"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={bankData.bankAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors['bankAddress.city'] ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="New York"
                />
                {errors['bankAddress.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['bankAddress.city']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={bankData.bankAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors['bankAddress.state'] ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors['bankAddress.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['bankAddress.state']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  value={bankData.bankAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className={`w-full px-3 py-2 border ${errors['bankAddress.zipCode'] ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="10001"
                />
                {errors['bankAddress.zipCode'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['bankAddress.zipCode']}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Phone Number *
              </label>
              <input
                type="tel"
                value={bankData.bankPhone}
                onChange={(e) => handleInputChange('bankPhone', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.bankPhone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="(555) 123-4567"
              />
              {errors.bankPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.bankPhone}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* ACH Authorization */}
        <div className="border-t pt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">ACH Authorization</h4>
                
                <div className="flex items-start mb-4">
                  <input
                    type="checkbox"
                    id="achAuthorization"
                    checked={bankData.achAuthorization}
                    onChange={(e) => handleInputChange('achAuthorization', e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="achAuthorization" className="text-sm text-gray-700">
                    I authorize Medical Marketplace to initiate electronic credits and debits to my bank account for the purpose of processing payments and refunds. This authorization will remain in effect until I provide written notice of cancellation.
                  </label>
                </div>
                
                {errors.achAuthorization && (
                  <p className="mt-1 text-sm text-red-600">{errors.achAuthorization}</p>
                )}
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">By authorizing ACH transactions, you confirm that:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You are an authorized signer on the account</li>
                    <li>The account is located at a U.S. financial institution</li>
                    <li>You can cancel this authorization at any time by contacting support</li>
                  </ul>
                </div>
              </div>
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
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue to Documents
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step7BankAccount