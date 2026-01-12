import React, { useState } from 'react'
import { 
  Banknote, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  User,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  Copy
} from 'lucide-react'
import { format } from 'date-fns'
import { STATES } from '../../utils/constants'

const BankDetailsTab = ({ vendor, adminView = true }) => {
  const [revealedData, setRevealedData] = useState({})
  const [copiedField, setCopiedField] = useState(null)

  const bankAccount = vendor?.bankAccount

  if (!bankAccount) {
    return (
      <div className="p-8 text-center">
        <Banknote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bank Account Information</h3>
        <p className="text-gray-500">
          This vendor has not provided bank account details yet.
        </p>
      </div>
    )
  }

  const toggleVisibility = (field) => {
    setRevealedData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const maskSensitiveData = (data, field) => {
    if (!data) return '—'
    
    if (adminView && revealedData[field]) {
      return data
    }
    
    // Mask all but last 4 characters for admin view
    if (adminView) {
      return '•'.repeat(Math.max(0, data.length - 4)) + data.slice(-4)
    }
    
    // For non-admin, show fully masked
    return '•'.repeat(data.length)
  }

  const getStateName = (stateCode) => {
    const state = STATES.find(s => s.value === stateCode)
    return state ? state.label : stateCode
  }

  const sensitiveFields = [
    {
      label: 'Account Holder Name',
      value: bankAccount.accountHolderName,
      field: 'accountHolderName',
      icon: User,
      sensitive: false
    },
    {
      label: 'Bank Name',
      value: bankAccount.bankName,
      field: 'bankName',
      icon: Building,
      sensitive: false
    },
    {
      label: 'Account Type',
      value: bankAccount.accountType,
      field: 'accountType',
      icon: CreditCard,
      sensitive: false
    },
    {
      label: 'Routing Number',
      value: bankAccount.routingNumber || bankAccount.maskedRoutingNumber,
      field: 'routingNumber',
      icon: CreditCard,
      sensitive: true
    },
    {
      label: 'Account Number',
      value: bankAccount.accountNumber || bankAccount.maskedAccountNumber,
      field: 'accountNumber',
      icon: CreditCard,
      sensitive: true
    },
    {
      label: 'Bank Phone',
      value: bankAccount.bankPhone,
      field: 'bankPhone',
      icon: Phone,
      sensitive: false
    }
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Account Details</h2>
          <p className="text-gray-600 mt-1">
            Secure bank information for payment processing
            {adminView && ' • Click eye icons to reveal sensitive data'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">Encrypted</span>
        </div>
      </div>

      {/* Security Notice */}
      {adminView && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-emerald-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Secure Information Access</h4>
              <p className="text-sm text-gray-700">
                You are viewing sensitive bank account information. This data is encrypted and should be handled securely.
                Click the eye icons to reveal full account details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensitiveFields.map((field) => (
          <div 
            key={field.field} 
            className={`bg-white rounded-xl border ${field.sensitive ? 'border-emerald-100' : 'border-gray-100'} p-5 hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <field.icon className="h-5 w-5 text-emerald-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">{field.label}</h4>
              </div>
              <div className="flex items-center space-x-2">
                {field.sensitive && adminView && (
                  <button
                    onClick={() => toggleVisibility(field.field)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title={revealedData[field.field] ? "Hide" : "Reveal"}
                  >
                    {revealedData[field.field] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
                {adminView && (
                  <button
                    onClick={() => copyToClipboard(field.value, field.field)}
                    className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-lg font-semibold font-mono ${field.sensitive && !revealedData[field.field] ? 'text-gray-400' : 'text-gray-900'}`}>
                {field.sensitive ? maskSensitiveData(field.value, field.field) : field.value || '—'}
              </p>
              {copiedField === field.field && (
                <span className="text-xs text-emerald-600 animate-pulse">Copied!</span>
              )}
            </div>
          </div>
        ))}

        {/* ACH Authorization Status */}
        <div className={`md:col-span-2 lg:col-span-3 ${bankAccount.achAuthorization ? 'bg-emerald-50' : 'bg-amber-50'} rounded-xl p-5 border ${bankAccount.achAuthorization ? 'border-emerald-200' : 'border-amber-200'}`}>
          <div className="flex items-center">
            {bankAccount.achAuthorization ? (
              <CheckCircle className="h-8 w-8 text-emerald-600 mr-4" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-600 mr-4" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">
                {bankAccount.achAuthorization ? 'ACH Authorization Active' : 'ACH Authorization Not Active'}
              </h4>
              {bankAccount.authorizationDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Authorized on {format(new Date(bankAccount.authorizationDate), 'MMMM d, yyyy')}
                </p>
              )}
              <p className="text-sm text-gray-700 mt-2">
                {bankAccount.achAuthorization 
                  ? 'This vendor has authorized electronic credits and debits to their bank account.'
                  : 'This vendor has not authorized ACH transactions.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Address Section */}
      {bankAccount.bankAddress && (
        <div className="mt-8">
          <div className="flex items-center mb-6">
            <MapPin className="h-6 w-6 text-teal-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Bank Address</h3>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-600">Address Line 1</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {bankAccount.bankAddress.line1 || '—'}
                </p>
              </div>
              
              {bankAccount.bankAddress.line2 && (
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-600">Address Line 2</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {bankAccount.bankAddress.line2}
                  </p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-600">City</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {bankAccount.bankAddress.city || '—'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-600">State</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {getStateName(bankAccount.bankAddress.state) || '—'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-600">Zip Code</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {bankAccount.bankAddress.zipCode || '—'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {bankAccount.bankPhone || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail (Admin Only) */}
      {adminView && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-gray-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Account Verification</h3>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Account Status</h4>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${bankAccount.achAuthorization ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-medium text-gray-900">
                    {bankAccount.achAuthorization ? 'Verified & Active' : 'Pending Verification'}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Last Updated</h4>
                <p className="font-medium text-gray-900">
                  {bankAccount.authorizationDate 
                    ? format(new Date(bankAccount.authorizationDate), 'MMM d, yyyy')
                    : 'Not recorded'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Notes</h4>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add notes about this bank account (verification status, issues, etc.)"
                  defaultValue={bankAccount.adminNotes || ''}
                />
                <div className="mt-2 flex justify-end">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="mt-8 p-4 bg-gradient-to-r from-gray-900 to-black rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-white mr-3" />
            <div>
              <h4 className="text-sm font-medium text-white">Bank Account Security</h4>
              <p className="text-xs text-gray-300">
                All data is encrypted using AES-256 encryption
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Access logged: {format(new Date(), 'MMM d, yyyy h:mm a')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankDetailsTab