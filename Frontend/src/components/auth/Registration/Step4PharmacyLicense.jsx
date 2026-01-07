import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { updateFormData, nextStep, prevStep } from '../../../store/slices/registrationSlice'
import { Calendar } from 'lucide-react'

const Step4PharmacyLicense = () => {
  const dispatch = useDispatch()
  const { formData } = useSelector((state) => state.registration)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.pharmacyLicense || {}
  })
  
  const [deaExpiration, setDeaExpiration] = useState(
    formData.pharmacyLicense?.deaExpirationDate || ''
  )
  const [stateLicenseExpiration, setStateLicenseExpiration] = useState(
    formData.pharmacyLicense?.stateLicenseExpirationDate || ''
  )
  
  const onSubmit = (data) => {
    const licenseData = {
      ...data,
      deaExpirationDate: deaExpiration,
      stateLicenseExpirationDate: stateLicenseExpiration
    }
    
    dispatch(updateFormData({
      step: 4,
      data: licenseData
    }))
    dispatch(nextStep())
  }
  
  const handleBack = () => {
    dispatch(prevStep())
  }
  
  const today = new Date().toISOString().split('T')[0]
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Pharmacy License Information</h2>
      <p className="text-sm text-gray-600 mb-6">
        Provide your pharmacy's licensing information. All licenses must be current and valid.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DEA Registration Number *
          </label>
          <input
            type="text"
            {...register('deaNumber', {
              required: 'DEA# is required',
              pattern: {
                value: /^[A-Z]{2}[0-9]{7}$/,
                message: 'DEA# format: 2 letters followed by 7 digits (e.g., AB1234567)'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="AB1234567"
          />
          {errors.deaNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.deaNumber.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format: 2 letters followed by 7 digits
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DEA Expiration Date *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={deaExpiration}
              onChange={(e) => setDeaExpiration(e.target.value)}
              min={today}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            DEA license must be valid for at least 6 months from today
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State License Number *
          </label>
          <input
            type="text"
            {...register('stateLicenseNumber', {
              required: 'State license number is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.stateLicenseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.stateLicenseNumber.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State License Expiration Date *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={stateLicenseExpiration}
              onChange={(e) => setStateLicenseExpiration(e.target.value)}
              min={today}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            State license must be valid for at least 6 months from today
          </p>
        </div>
        
        {/* License Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">License Requirements</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
              <span className="ml-2">All licenses must be current and valid</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
              <span className="ml-2">Upload copies of both DEA and State licenses in Step 7</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
              <span className="ml-2">Licenses must be issued in the same state as your pharmacy</span>
            </li>
          </ul>
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
            Next: Pharmacy Questions
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step4PharmacyLicense