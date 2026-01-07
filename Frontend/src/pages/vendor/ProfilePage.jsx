import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Building2, 
  User, 
  Phone, 
  FileText, 
  CheckCircle, 
  MapPin, 
  Mail,
  Calendar,
  Shield,
  CreditCard,
  Users,
  HelpCircle,
  FileUp,
  Edit2
} from 'lucide-react'
import { STATES, TIMEZONES, ENTERPRISE_TYPES, PHARMACY_TYPES, REFERRAL_SOURCES } from '../../utils/constants'
import { format } from 'date-fns'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ProfilePage = () => {
  const { user, isLoading: authLoading } = useSelector((state) => state.auth)
  
  const [activeTab, setActiveTab] = useState('pharmacy-info')
  const [isEditing, setIsEditing] = useState(false)
  
  const tabs = [
    { id: 'pharmacy-info', label: 'Pharmacy Info', icon: Building2 },
    { id: 'pharmacy-owner', label: 'Pharmacy Owner', icon: User },
    { id: 'primary-contact', label: 'Primary Contact', icon: Phone },
    { id: 'license', label: 'License Info', icon: Shield },
    { id: 'business-info', label: 'Business Info', icon: CreditCard },
    { id: 'referral', label: 'Referral Info', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText }
  ]
  
  if (authLoading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No profile data</h3>
        <p className="mt-1 text-sm text-gray-500">Please login to view your profile.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <Building2 className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.pharmacyInfo?.legalBusinessName}
                </h1>
                <p className="text-sm text-gray-600">
                  {user.pharmacyInfo?.dba}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Status: {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
              </span>
              {user.approvedAt && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Calendar className="h-4 w-4 mr-1" />
                  Approved: {format(new Date(user.approvedAt), 'MMM d, yyyy')}
                </span>
              )}
              {user.registeredAt && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Calendar className="h-4 w-4 mr-1" />
                  Registered: {format(new Date(user.registeredAt), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        {user.profileCompleted && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700">Profile completed</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`h-5 w-5 inline mr-2 ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                }`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'pharmacy-info' && (
            <PharmacyInfoTab data={user.pharmacyInfo} isEditing={isEditing} />
          )}
          
          {activeTab === 'pharmacy-owner' && (
            <PharmacyOwnerTab data={user.pharmacyOwner} isEditing={isEditing} />
          )}
          
          {activeTab === 'primary-contact' && (
            <PrimaryContactTab data={user.primaryContact} isEditing={isEditing} />
          )}
          
          {activeTab === 'license' && (
            <LicenseTab data={user.pharmacyLicense} isEditing={isEditing} />
          )}
          
          {activeTab === 'business-info' && (
            <BusinessInfoTab data={user.pharmacyQuestions} isEditing={isEditing} />
          )}
          
          {activeTab === 'referral' && (
            <ReferralTab data={user.referralInfo} isEditing={isEditing} />
          )}
          
          {activeTab === 'documents' && (
            <DocumentsTab documents={user.documents} />
          )}
        </div>
      </div>
    </div>
  )
}

// Updated Tab Components (View Only)
const PharmacyInfoTab = ({ data, isEditing }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Pharmacy Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          NPI Number
        </label>
        <p className="text-gray-900">{data?.npiNumber || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legal Business Name
        </label>
        <p className="text-gray-900">{data?.legalBusinessName || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DBA (Doing Business As)
        </label>
        <p className="text-gray-900">{data?.dba || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <p className="text-gray-900">{data?.phone || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Federal EIN
        </label>
        <p className="text-gray-900">{data?.federalEIN || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          GLN
        </label>
        <p className="text-gray-900">{data?.gln || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State Tax ID
        </label>
        <p className="text-gray-900">{data?.stateTaxID || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <p className="text-gray-900">
          {TIMEZONES.find(t => t.value === data?.timezone)?.label || data?.timezone || '—'}
        </p>
      </div>
    </div>
    
    {/* Address Section */}
    {data?.shippingAddress && (
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Shipping Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <p className="text-gray-900">{data.shippingAddress.line1 || '—'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <p className="text-gray-900">{data.shippingAddress.line2 || '—'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <p className="text-gray-900">{data.shippingAddress.city || '—'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <p className="text-gray-900">
              {STATES.find(s => s.value === data.shippingAddress?.state)?.label || data.shippingAddress?.state || '—'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <p className="text-gray-900">{data.shippingAddress.zipCode || '—'}</p>
          </div>
        </div>
      </div>
    )}
    
    {/* Mailing Address */}
    {data?.mailingAddress && !data.mailingAddress.isSameAsShipping && (
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Mailing Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <p className="text-gray-900">{data.mailingAddress.line1 || '—'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <p className="text-gray-900">{data.mailingAddress.line2 || '—'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <p className="text-gray-900">{data.mailingAddress.city || '—'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <p className="text-gray-900">
              {STATES.find(s => s.value === data.mailingAddress?.state)?.label || data.mailingAddress?.state || '—'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <p className="text-gray-900">{data.mailingAddress.zipCode || '—'}</p>
          </div>
        </div>
      </div>
    )}
  </div>
)

const PharmacyOwnerTab = ({ data }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Pharmacy Owner Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <p className="text-gray-900">{data?.firstName || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <p className="text-gray-900">{data?.lastName || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number
        </label>
        <p className="text-gray-900">{data?.mobile || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400 mr-2" />
          <p className="text-gray-900">{data?.email || '—'}</p>
        </div>
      </div>
    </div>
  </div>
)

const PrimaryContactTab = ({ data }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Primary Contact Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <p className="text-gray-900">{data?.title || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <p className="text-gray-900">{data?.firstName || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <p className="text-gray-900">{data?.lastName || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number
        </label>
        <p className="text-gray-900">{data?.mobile || '—'}</p>
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400 mr-2" />
          <p className="text-gray-900">{data?.email || '—'}</p>
        </div>
      </div>
    </div>
  </div>
)

const LicenseTab = ({ data }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Pharmacy License Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DEA Registration Number
        </label>
        <p className="text-gray-900">{data?.deaNumber || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DEA Expiration Date
        </label>
        <p className="text-gray-900">
          {data?.deaExpirationDate ? format(new Date(data.deaExpirationDate), 'MMM d, yyyy') : '—'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State License Number
        </label>
        <p className="text-gray-900">{data?.stateLicenseNumber || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State License Expiration Date
        </label>
        <p className="text-gray-900">
          {data?.stateLicenseExpirationDate ? format(new Date(data.stateLicenseExpirationDate), 'MMM d, yyyy') : '—'}
        </p>
      </div>
    </div>
  </div>
)

const BusinessInfoTab = ({ data }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enterprise Type
        </label>
        <p className="text-gray-900">
          {ENTERPRISE_TYPES.find(t => t.value === data?.enterpriseType)?.label || data?.enterpriseType || '—'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pharmacy Type
        </label>
        <p className="text-gray-900">
          {PHARMACY_TYPES.find(t => t.value === data?.pharmacyType)?.label || data?.pharmacyType || '—'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Wholesaler
        </label>
        <p className="text-gray-900">{data?.primaryWholesaler || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secondary Wholesaler
        </label>
        <p className="text-gray-900">{data?.secondaryWholesaler || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pharmacy Software
        </label>
        <p className="text-gray-900">{data?.pharmacySoftware || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Locations
        </label>
        <p className="text-gray-900">{data?.numberOfLocations || '—'}</p>
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hours of Operation
        </label>
        <p className="text-gray-900 whitespace-pre-line">{data?.hoursOfOperation || '—'}</p>
      </div>
    </div>
  </div>
)

const ReferralTab = ({ data }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Referral Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Promo Code
        </label>
        <p className="text-gray-900">{data?.promoCode || '—'}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How did you hear about us?
        </label>
        <p className="text-gray-900">
          {REFERRAL_SOURCES.find(s => s.value === data?.referralSource)?.label || data?.referralSource || '—'}
        </p>
      </div>
      
      <div className="md:col-span-2">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-gray-900">Terms & Conditions Accepted</span>
        </div>
        {data?.acceptedAt && (
          <p className="text-sm text-gray-500 mt-1">
            Accepted on {format(new Date(data.acceptedAt), 'MMM d, yyyy')}
          </p>
        )}
      </div>
    </div>
  </div>
)

const DocumentsTab = ({ documents }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
    
    {documents && documents.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded: {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : '—'}
                </p>
                {doc.url && (
                  <div className="mt-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      <FileUp className="h-4 w-4 mr-1" />
                      View Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
        <p className="mt-1 text-sm text-gray-500">
          Documents will appear here once uploaded during registration.
        </p>
      </div>
    )}
    
    <div className="bg-blue-50 rounded-lg p-4 mt-6">
      <div className="flex">
        <HelpCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            These are the documents you submitted during registration. If you need to update any documents, 
            please contact our support team at support@medicalmarketplace.com
          </p>
        </div>
      </div>
    </div>
  </div>
)

export default ProfilePage