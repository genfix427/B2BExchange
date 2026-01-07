import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { updateFormData, nextStep } from '../../../store/slices/registrationSlice'
import { STATES, TIMEZONES } from '../../../utils/constants'

const Step1PharmacyInfo = () => {
  const dispatch = useDispatch()
  const { formData } = useSelector((state) => state.registration)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: formData.pharmacyInfo || {}
  })
  
  const [sameAsShipping, setSameAsShipping] = useState(
    formData.pharmacyInfo?.mailingAddress?.isSameAsShipping || false
  )
  
  const shippingAddress = watch()
  
  const onSubmit = (data) => {
    dispatch(updateFormData({
      step: 1,
      data: {
        ...data,
        mailingAddress: sameAsShipping ? {
          ...data.shippingAddress,
          isSameAsShipping: true
        } : data.mailingAddress
      }
    }))
    dispatch(nextStep())
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Pharmacy Information</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* NPI & Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NPI# *
            </label>
            <input
              type="text"
              {...register('npiNumber', {
                required: 'NPI# is required',
                pattern: {
                  value: /^\d{10}$/,
                  message: 'Must be 10 digits'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234567890"
            />
            {errors.npiNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.npiNumber.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Business Name *
            </label>
            <input
              type="text"
              {...register('legalBusinessName', {
                required: 'Legal business name is required'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.legalBusinessName && (
              <p className="mt-1 text-sm text-red-600">{errors.legalBusinessName.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DBA (Doing Business As) *
          </label>
          <input
            type="text"
            {...register('dba', {
              required: 'DBA is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dba && (
            <p className="mt-1 text-sm text-red-600">{errors.dba.message}</p>
          )}
        </div>
        
        {/* Shipping Address */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                {...register('shippingAddress.line1', {
                  required: 'Address line 1 is required'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.shippingAddress?.line1 && (
                <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.line1.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                {...register('shippingAddress.line2')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register('shippingAddress.city', {
                    required: 'City is required'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.shippingAddress?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.city.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  {...register('shippingAddress.state', {
                    required: 'State is required'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.shippingAddress?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.state.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  {...register('shippingAddress.zipCode', {
                    required: 'Zip code is required',
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
                      message: 'Invalid zip code format'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345 or 12345-6789"
                />
                {errors.shippingAddress?.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Invalid phone number'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fax
            </label>
            <input
              type="tel"
              {...register('fax', {
                pattern: {
                  value: /^[\+]?[1-9][\d]{0,15}$/,
                  message: 'Invalid fax number'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.fax && (
              <p className="mt-1 text-sm text-red-600">{errors.fax.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone *
          </label>
          <select
            {...register('timezone', {
              required: 'Timezone is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
          )}
        </div>
        
        {/* Tax IDs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Federal EIN *
            </label>
            <input
              type="text"
              {...register('federalEIN', {
                required: 'Federal EIN is required',
                pattern: {
                  value: /^\d{2}-\d{7}$/,
                  message: 'Format: XX-XXXXXXX'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12-3456789"
            />
            {errors.federalEIN && (
              <p className="mt-1 text-sm text-red-600">{errors.federalEIN.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Tax ID *
            </label>
            <input
              type="text"
              {...register('stateTaxID', {
                required: 'State Tax ID is required'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.stateTaxID && (
              <p className="mt-1 text-sm text-red-600">{errors.stateTaxID.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GLN (Global Location Number) *
          </label>
          <input
            type="text"
            {...register('gln', {
              required: 'GLN is required'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.gln && (
            <p className="mt-1 text-sm text-red-600">{errors.gln.message}</p>
          )}
        </div>
        
        {/* Mailing Address */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Mailing Address</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sameAsShipping"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                Same as shipping address
              </label>
            </div>
          </div>
          
          {!sameAsShipping ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  {...register('mailingAddress.line1', {
                    required: 'Address line 1 is required'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.mailingAddress?.line1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.mailingAddress.line1.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  {...register('mailingAddress.line2')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('mailingAddress.city', {
                      required: 'City is required'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mailingAddress?.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.mailingAddress.city.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <select
                    {...register('mailingAddress.state', {
                      required: 'State is required'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  {errors.mailingAddress?.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.mailingAddress.state.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    {...register('mailingAddress.zipCode', {
                      required: 'Zip code is required',
                      pattern: {
                        value: /^\d{5}(-\d{4})?$/,
                        message: 'Invalid zip code format'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mailingAddress?.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.mailingAddress.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                Mailing address will be the same as shipping address
              </p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next: Pharmacy Owner
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step1PharmacyInfo