import React from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { updateFormData, nextStep, prevStep } from '../../../store/slices/registrationSlice'
import { ENTERPRISE_TYPES, PHARMACY_TYPES } from '../../../utils/constants'

const Step5PharmacyQuestions = () => {
  const dispatch = useDispatch()
  const { formData } = useSelector((state) => state.registration)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.pharmacyQuestions || {}
  })
  
  const onSubmit = (data) => {
    dispatch(updateFormData({
      step: 5,
      data
    }))
    dispatch(nextStep())
  }
  
  const handleBack = () => {
    dispatch(prevStep())
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 5: Pharmacy Business Information</h2>
      <p className="text-sm text-gray-600 mb-6">
        Help us understand your pharmacy's operations and needs.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enterprise Type *
          </label>
          <select
            {...register('enterpriseType', {
              required: 'Enterprise type is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Enterprise Type</option>
            {ENTERPRISE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.enterpriseType && (
            <p className="mt-1 text-sm text-red-600">{errors.enterpriseType.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Wholesaler *
          </label>
          <input
            type="text"
            {...register('primaryWholesaler', {
              required: 'Primary wholesaler is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., ABC Medical Supply, XYZ Pharmaceuticals"
          />
          {errors.primaryWholesaler && (
            <p className="mt-1 text-sm text-red-600">{errors.primaryWholesaler.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Secondary Wholesaler (Optional)
          </label>
          <input
            type="text"
            {...register('secondaryWholesaler')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., DEF Drug Distributors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type of Pharmacy *
          </label>
          <select
            {...register('pharmacyType', {
              required: 'Pharmacy type is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Pharmacy Type</option>
            {PHARMACY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.pharmacyType && (
            <p className="mt-1 text-sm text-red-600">{errors.pharmacyType.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pharmacy Software *
          </label>
          <input
            type="text"
            {...register('pharmacySoftware', {
              required: 'Pharmacy software is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., PioneerRx, Rx30, Computer-Rx"
          />
          {errors.pharmacySoftware && (
            <p className="mt-1 text-sm text-red-600">{errors.pharmacySoftware.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours of Operation *
          </label>
          <input
            type="text"
            {...register('hoursOfOperation', {
              required: 'Hours of operation are required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mon-Fri: 9am-6pm, Sat: 10am-2pm, Sun: Closed"
          />
          {errors.hoursOfOperation && (
            <p className="mt-1 text-sm text-red-600">{errors.hoursOfOperation.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Locations *
          </label>
          <input
            type="number"
            min="1"
            {...register('numberOfLocations', {
              required: 'Number of locations is required',
              min: {
                value: 1,
                message: 'Must have at least 1 location'
              },
              valueAsNumber: true
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
          {errors.numberOfLocations && (
            <p className="mt-1 text-sm text-red-600">{errors.numberOfLocations.message}</p>
          )}
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
            Next: Referral Information
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step5PharmacyQuestions