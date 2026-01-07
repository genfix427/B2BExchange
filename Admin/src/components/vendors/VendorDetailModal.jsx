import React, { useState } from 'react'
import { 
  X, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  User,
  Shield,
  CreditCard,
  Users,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { 
  STATES, 
  TIMEZONES, 
  ENTERPRISE_TYPES, 
  PHARMACY_TYPES, 
  REFERRAL_SOURCES,
  DOCUMENT_TYPES 
} from '../../utils/constants'

const VendorDetailModal = ({ vendor, isOpen, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showDocuments, setShowDocuments] = useState(false)
  
  if (!isOpen || !vendor) return null
  
  const handleApprove = () => {
    if (window.confirm(`Approve ${vendor.pharmacyInfo?.legalBusinessName}? This will send an approval email to the vendor.`)) {
      onApprove(vendor._id)
      onClose()
    }
  }
  
  const handleReject = () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (minimum 10 characters).')
      return
    }
    
    if (window.confirm(`Reject ${vendor.pharmacyInfo?.legalBusinessName}? This will notify the vendor and they will need to reapply.`)) {
      onReject(vendor._id, rejectionReason.trim())
      onClose()
    }
  }
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'pharmacy', label: 'Pharmacy Info' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'license', label: 'License' },
    { id: 'business', label: 'Business' },
    { id: 'documents', label: 'Documents' }
  ]
  
  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      suspended: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    
    const { color, icon: Icon } = config[status] || config.pending
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-10 w-10 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {vendor.pharmacyInfo?.legalBusinessName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {vendor.pharmacyInfo?.dba} • NPI: {vendor.pharmacyInfo?.npiNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(vendor.status)}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Registration Info */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Registered: {format(new Date(vendor.registeredAt), 'PPP')}</span>
                </div>
                {vendor.approvedAt && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Approved: {format(new Date(vendor.approvedAt), 'PPP')}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{vendor.email}</span>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="px-4 sm:px-6 pb-4">
            {activeTab === 'overview' && <OverviewTab vendor={vendor} />}
            {activeTab === 'pharmacy' && <PharmacyTab vendor={vendor} />}
            {activeTab === 'contacts' && <ContactsTab vendor={vendor} />}
            {activeTab === 'license' && <LicenseTab vendor={vendor} />}
            {activeTab === 'business' && <BusinessTab vendor={vendor} />}
            {activeTab === 'documents' && <DocumentsTab vendor={vendor} />}
          </div>
          
          {/* Action Buttons (only show for pending vendors) */}
          {vendor.status === 'pending' && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
              <div className="w-full">
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (required for rejection)
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide detailed reason for rejection (minimum 10 characters)"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This reason will be shared with the vendor
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Vendor
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </button>
                  
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons for approved/rejected vendors */}
          {vendor.status !== 'pending' && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Tab Components
const OverviewTab = ({ vendor }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Pharmacy Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Business Type:</span>
            <span className="text-sm font-medium text-blue-900">
              {ENTERPRISE_TYPES.find(t => t.value === vendor.pharmacyQuestions?.enterpriseType)?.label || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Pharmacy Type:</span>
            <span className="text-sm font-medium text-blue-900">
              {PHARMACY_TYPES.find(t => t.value === vendor.pharmacyQuestions?.pharmacyType)?.label || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Locations:</span>
            <span className="text-sm font-medium text-blue-900">
              {vendor.pharmacyQuestions?.numberOfLocations || '—'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">
              {vendor.pharmacyOwner?.firstName} {vendor.pharmacyOwner?.lastName}
            </span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">{vendor.pharmacyOwner?.mobile}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">{vendor.pharmacyOwner?.email}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-2">License Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-purple-700">DEA Number:</span>
            <span className="text-sm font-medium text-purple-900">{vendor.pharmacyLicense?.deaNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-purple-700">DEA Expires:</span>
            <span className="text-sm font-medium text-purple-900">
              {vendor.pharmacyLicense?.deaExpirationDate ? 
                format(new Date(vendor.pharmacyLicense.deaExpirationDate), 'PP') : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-purple-700">State License:</span>
            <span className="text-sm font-medium text-purple-900">{vendor.pharmacyLicense?.stateLicenseNumber}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Business Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-yellow-700">Primary Wholesaler:</span>
            <span className="text-sm font-medium text-yellow-900">
              {vendor.pharmacyQuestions?.primaryWholesaler || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-yellow-700">Software:</span>
            <span className="text-sm font-medium text-yellow-900">
              {vendor.pharmacyQuestions?.pharmacySoftware || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-yellow-700">Referral Source:</span>
            <span className="text-sm font-medium text-yellow-900">
              {REFERRAL_SOURCES.find(s => s.value === vendor.referralInfo?.referralSource)?.label || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Quick Document Preview */}
    {vendor.documents && vendor.documents.length > 0 && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Document Preview</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {vendor.documents.slice(0, 3).map((doc, index) => (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-xs font-medium text-gray-700 truncate">{doc.name}</span>
            </a>
          ))}
          {vendor.documents.length > 3 && (
            <button
              onClick={() => {}}
              className="flex items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600"
            >
              +{vendor.documents.length - 3} more
            </button>
          )}
        </div>
      </div>
    )}
  </div>
)

const PharmacyTab = ({ vendor }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
        <div className="space-y-3">
          <InfoRow label="Legal Business Name" value={vendor.pharmacyInfo?.legalBusinessName} />
          <InfoRow label="DBA" value={vendor.pharmacyInfo?.dba} />
          <InfoRow label="NPI Number" value={vendor.pharmacyInfo?.npiNumber} />
          <InfoRow label="Federal EIN" value={vendor.pharmacyInfo?.federalEIN} />
          <InfoRow label="State Tax ID" value={vendor.pharmacyInfo?.stateTaxID} />
          <InfoRow label="GLN" value={vendor.pharmacyInfo?.gln} />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Details</h4>
        <div className="space-y-3">
          <InfoRow label="Phone" value={vendor.pharmacyInfo?.phone} icon={Phone} />
          <InfoRow label="Fax" value={vendor.pharmacyInfo?.fax} />
          <InfoRow label="Timezone" value={
            TIMEZONES.find(t => t.value === vendor.pharmacyInfo?.timezone)?.label || vendor.pharmacyInfo?.timezone
          } />
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h4>
        <div className="space-y-2">
          <p className="text-sm text-gray-900">{vendor.pharmacyInfo?.shippingAddress?.line1}</p>
          {vendor.pharmacyInfo?.shippingAddress?.line2 && (
            <p className="text-sm text-gray-900">{vendor.pharmacyInfo.shippingAddress.line2}</p>
          )}
          <p className="text-sm text-gray-900">
            {vendor.pharmacyInfo?.shippingAddress?.city}, {vendor.pharmacyInfo?.shippingAddress?.state} {vendor.pharmacyInfo?.shippingAddress?.zipCode}
          </p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Mailing Address</h4>
        {vendor.pharmacyInfo?.mailingAddress?.isSameAsShipping ? (
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Same as shipping address
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-900">{vendor.pharmacyInfo?.mailingAddress?.line1}</p>
            {vendor.pharmacyInfo?.mailingAddress?.line2 && (
              <p className="text-sm text-gray-900">{vendor.pharmacyInfo.mailingAddress.line2}</p>
            )}
            <p className="text-sm text-gray-900">
              {vendor.pharmacyInfo?.mailingAddress?.city}, {vendor.pharmacyInfo?.mailingAddress?.state} {vendor.pharmacyInfo?.mailingAddress?.zipCode}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)

const ContactsTab = ({ vendor }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Pharmacy Owner
        </h4>
        <div className="space-y-3">
          <InfoRow label="Full Name" value={
            `${vendor.pharmacyOwner?.firstName} ${vendor.pharmacyOwner?.lastName}`
          } />
          <InfoRow label="Mobile" value={vendor.pharmacyOwner?.mobile} icon={Phone} />
          <InfoRow label="Email" value={vendor.pharmacyOwner?.email} icon={Mail} />
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          Primary Contact
        </h4>
        <div className="space-y-3">
          <InfoRow label="Title" value={vendor.primaryContact?.title} />
          <InfoRow label="Full Name" value={
            `${vendor.primaryContact?.firstName} ${vendor.primaryContact?.lastName}`
          } />
          <InfoRow label="Mobile" value={vendor.primaryContact?.mobile} icon={Phone} />
          <InfoRow label="Email" value={vendor.primaryContact?.email} icon={Mail} />
        </div>
      </div>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Login Email" value={vendor.email} />
        <InfoRow label="Registration Date" value={format(new Date(vendor.registeredAt), 'PPpp')} />
        {vendor.lastLoginAt && (
          <InfoRow label="Last Login" value={format(new Date(vendor.lastLoginAt), 'PPpp')} />
        )}
        <InfoRow label="Profile Completed" value={vendor.profileCompleted ? 'Yes' : 'No'} />
      </div>
    </div>
  </div>
)

const LicenseTab = ({ vendor }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          DEA Registration
        </h4>
        <div className="space-y-3">
          <InfoRow label="DEA Number" value={vendor.pharmacyLicense?.deaNumber} />
          <InfoRow label="Expiration Date" value={
            vendor.pharmacyLicense?.deaExpirationDate ? 
              format(new Date(vendor.pharmacyLicense.deaExpirationDate), 'PP') : '—'
          } />
          <div className="pt-2">
            <p className="text-xs text-purple-600">
              {vendor.pharmacyLicense?.deaExpirationDate && 
                new Date(vendor.pharmacyLicense.deaExpirationDate) < new Date() ? (
                  <span className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    License expired
                  </span>
                ) : vendor.pharmacyLicense?.deaExpirationDate ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid until {format(new Date(vendor.pharmacyLicense.deaExpirationDate), 'PP')}
                  </span>
                ) : null
              }
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          State License
        </h4>
        <div className="space-y-3">
          <InfoRow label="License Number" value={vendor.pharmacyLicense?.stateLicenseNumber} />
          <InfoRow label="Expiration Date" value={
            vendor.pharmacyLicense?.stateLicenseExpirationDate ? 
              format(new Date(vendor.pharmacyLicense.stateLicenseExpirationDate), 'PP') : '—'
          } />
          <div className="pt-2">
            <p className="text-xs text-blue-600">
              {vendor.pharmacyLicense?.stateLicenseExpirationDate && 
                new Date(vendor.pharmacyLicense.stateLicenseExpirationDate) < new Date() ? (
                  <span className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    License expired
                  </span>
                ) : vendor.pharmacyLicense?.stateLicenseExpirationDate ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid until {format(new Date(vendor.pharmacyLicense.stateLicenseExpirationDate), 'PP')}
                  </span>
                ) : null
              }
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">License Verification</h4>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Verify the uploaded license documents match the information provided above.
        </p>
        <div className="flex items-center space-x-2">
          <a
            href={vendor.documents?.find(d => d.name.includes('DEA'))?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View DEA License
          </a>
          <a
            href={vendor.documents?.find(d => d.name.includes('State'))?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View State License
          </a>
        </div>
      </div>
    </div>
  </div>
)

const BusinessTab = ({ vendor }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Business Profile</h4>
        <div className="space-y-3">
          <InfoRow label="Enterprise Type" value={
            ENTERPRISE_TYPES.find(t => t.value === vendor.pharmacyQuestions?.enterpriseType)?.label || '—'
          } />
          <InfoRow label="Pharmacy Type" value={
            PHARMACY_TYPES.find(t => t.value === vendor.pharmacyQuestions?.pharmacyType)?.label || '—'
          } />
          <InfoRow label="Number of Locations" value={vendor.pharmacyQuestions?.numberOfLocations} />
          <InfoRow label="Pharmacy Software" value={vendor.pharmacyQuestions?.pharmacySoftware} />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Supply Chain</h4>
        <div className="space-y-3">
          <InfoRow label="Primary Wholesaler" value={vendor.pharmacyQuestions?.primaryWholesaler} />
          <InfoRow label="Secondary Wholesaler" value={vendor.pharmacyQuestions?.secondaryWholesaler || '—'} />
        </div>
      </div>
    </div>
    
    <div className="bg-yellow-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-yellow-900 mb-3">Operations</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-yellow-700 mb-1">Hours of Operation</label>
          <p className="text-sm text-yellow-900 whitespace-pre-line">
            {vendor.pharmacyQuestions?.hoursOfOperation || '—'}
          </p>
        </div>
      </div>
    </div>
    
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-blue-900 mb-3">Referral Information</h4>
      <div className="space-y-3">
        <InfoRow label="Referral Source" value={
          REFERRAL_SOURCES.find(s => s.value === vendor.referralInfo?.referralSource)?.label || '—'
        } />
        <InfoRow label="Promo Code" value={vendor.referralInfo?.promoCode || '—'} />
        <div className="pt-2">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-700">Terms & Conditions Accepted</span>
          </div>
          {vendor.referralInfo?.acceptedAt && (
            <p className="text-xs text-green-600 mt-1">
              Accepted on {format(new Date(vendor.referralInfo.acceptedAt), 'PP')}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
)

const DocumentsTab = ({ vendor }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendor.documents && vendor.documents.length > 0 ? (
        vendor.documents.map((doc, index) => (
          <DocumentCard key={index} document={doc} index={index} />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">
            The vendor has not uploaded any documents.
          </p>
        </div>
      )}
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Document Verification Notes</h4>
      <textarea
        placeholder="Add notes about document verification..."
        rows={3}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      <p className="mt-2 text-xs text-gray-500">
        These notes are for internal use only and will not be shared with the vendor.
      </p>
    </div>
  </div>
)

const DocumentCard = ({ document, index }) => {
  const getFileIcon = (fileName) => {
    if (fileName.includes('.pdf')) return '📄';
    if (fileName.includes('.doc')) return '📝';
    if (fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.jpeg')) return '🖼️';
    return '📎';
  }
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
            <span className="text-lg">{getFileIcon(document.name)}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {DOCUMENT_TYPES[index] || document.name}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Uploaded: {format(new Date(document.uploadedAt), 'PP')}
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </a>
            <a
              href={document.url}
              download
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-start">
    <span className="text-sm text-gray-600 flex items-center">
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900 text-right">{value || '—'}</span>
  </div>
)

export default VendorDetailModal