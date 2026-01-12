import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
  Edit2,
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
  Clock,
  Globe,
  Home,
  Briefcase,
  Award,
  Star,
  Sparkles,
  Banknote,
  Lock,
  Globe as GlobeIcon
} from 'lucide-react'
import { STATES, TIMEZONES, ENTERPRISE_TYPES, PHARMACY_TYPES, REFERRAL_SOURCES } from '../../utils/constants'
import { format } from 'date-fns'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { fetchVendorProfile, fetchVendorBankAccount } from '../../store/slices/vendorSlice'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user: authUser, isLoading: authLoading } = useSelector((state) => state.auth)
  const {
    profile: vendorProfile,
    isLoading: vendorLoading
  } = useSelector((state) => state.vendor)

  const bankDetails = vendorProfile?.bankAccount


  const [activeTab, setActiveTab] = useState('pharmacy-info')
  const [isEditing, setIsEditing] = useState(false)
  const [revealedData, setRevealedData] = useState({})
  const [decryptionKeys, setDecryptionKeys] = useState({})

  const tabs = [
    { id: 'pharmacy-info', label: 'Pharmacy Info', icon: Building2 },
    { id: 'pharmacy-owner', label: 'Owner', icon: User },
    { id: 'primary-contact', label: 'Contact', icon: Phone },
    { id: 'license', label: 'License', icon: Shield },
    { id: 'business-info', label: 'Business', icon: Briefcase },
    { id: 'bank-account', label: 'Bank Account', icon: Banknote },
    { id: 'referral', label: 'Referral', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText }
  ]

  // Fetch vendor profile and bank account on component mount
  useEffect(() => {
    if (authUser) {
      dispatch(fetchVendorProfile())
    }
  }, [dispatch, authUser])

  // Generate encryption key for sensitive data
  const generateKey = (field) => {
    const key = Math.random().toString(36).substring(2, 10)
    setDecryptionKeys(prev => ({ ...prev, [field]: key }))
    return key
  }

  // Encrypt sensitive data
  const encryptData = (data, field) => {
    if (!data) return null
    const key = decryptionKeys[field] || generateKey(field)
    // Simple obfuscation for demo - in production use proper encryption
    return Array.from(data).map((char, i) =>
      i < 4 || i >= data.length - 4 ? char : '•'
    ).join('')
  }

  // Toggle visibility of sensitive data
  const toggleVisibility = (field) => {
    setRevealedData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Render sensitive data with eye icon
  const SensitiveField = ({ label, value, field, icon: Icon }) => {
    const isRevealed = revealedData[field]

    return (
      <div className="bg-white rounded-xl border border-teal-100 p-5 group hover:border-emerald-200 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-emerald-500" />
            <h4 className="text-sm font-medium text-gray-700">{label}</h4>
          </div>
          <button
            onClick={() => toggleVisibility(field)}
            className="p-1.5 rounded-lg bg-teal-50 text-emerald-600 hover:bg-emerald-50 transition-colors"
            title={isRevealed ? "Hide" : "Show"}
          >
            {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className={`text-lg font-semibold font-mono ${isRevealed ? 'text-gray-900' : 'text-gray-400'}`}>
          {isRevealed ? value : encryptData(value, field)}
        </p>
      </div>
    )
  }

  // Use vendor profile if available, otherwise use auth user data
  const user = vendorProfile || authUser

  if (authLoading || vendorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative">
            <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-800">No profile data</h3>
          <p className="mt-2 text-gray-600">Please login to view your profile.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500'
      case 'pending': return 'bg-amber-500'
      case 'suspended': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/5 to-teal-500/5 rounded-bl-full"></div>

          <div className="relative flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
                <div className="ml-6">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {user.pharmacyInfo?.legalBusinessName || 'Pharmacy Name'}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(user.status)}`}>
                      {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-lg text-gray-600">
                    {user.pharmacyInfo?.dba || 'Doing Business As'}
                  </p>
                  <p className="mt-2 text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.npiNumber && (
                  <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                    <p className="text-sm font-medium text-gray-600">NPI Number</p>
                    <p className="text-lg font-semibold text-gray-900">{user.npiNumber}</p>
                  </div>
                )}
                {user.registeredAt && (
                  <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                    <p className="text-sm font-medium text-gray-600">Registered</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(user.registeredAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
                {user.approvedAt && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(user.approvedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Edit2 className="h-5 w-5 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-emerald-500'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
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

          {activeTab === 'bank-account' && (
            <BankAccountTab
              data={bankDetails}
              isEditing={isEditing}
              toggleVisibility={toggleVisibility}
              revealedData={revealedData}
            />
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

// Pharmacy Info Tab
const PharmacyInfoTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Building2 className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pharmacy Information</h2>
        <p className="text-gray-600">Basic pharmacy details and contact information</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { label: 'NPI Number', value: data?.npiNumber, icon: Award },
        { label: 'Legal Business Name', value: data?.legalBusinessName, icon: Building2 },
        { label: 'DBA', value: data?.dba, icon: FileText },
        { label: 'Phone', value: data?.phone, icon: Phone },
        { label: 'Fax', value: data?.fax, icon: Phone },
        { label: 'Federal EIN', value: data?.federalEIN, icon: CreditCard },
        { label: 'State Tax ID', value: data?.stateTaxID, icon: Shield },
        { label: 'GLN', value: data?.gln, icon: Award },
        { label: 'Timezone', value: TIMEZONES.find(t => t.value === data?.timezone)?.label || data?.timezone, icon: GlobeIcon },
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AddressSection
        title="Shipping Address"
        data={data?.shippingAddress}
        icon={MapPin}
        color="emerald"
      />
      <AddressSection
        title="Mailing Address"
        data={data?.mailingAddress}
        icon={Mail}
        color="teal"
      />
    </div>
  </div>
)

// Pharmacy Owner Tab
const PharmacyOwnerTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <User className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pharmacy Owner</h2>
        <p className="text-gray-600">Owner details and contact information</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'First Name', value: data?.firstName, icon: User },
        { label: 'Last Name', value: data?.lastName, icon: User },
        { label: 'Mobile', value: data?.mobile, icon: Phone },
        { label: 'Email', value: data?.email, icon: Mail },
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Primary Contact Tab
const PrimaryContactTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Phone className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Primary Contact</h2>
        <p className="text-gray-600">Main point of contact for the pharmacy</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Title', value: data?.title, icon: Briefcase },
        { label: 'First Name', value: data?.firstName, icon: User },
        { label: 'Last Name', value: data?.lastName, icon: User },
        { label: 'Mobile', value: data?.mobile, icon: Phone },
        { label: 'Email', value: data?.email, icon: Mail },
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// License Tab
const LicenseTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Shield className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">License Information</h2>
        <p className="text-gray-600">License details and expiration dates</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'DEA Number', value: data?.deaNumber, icon: Shield },
        {
          label: 'DEA Expiration',
          value: data?.deaExpirationDate ? format(new Date(data.deaExpirationDate), 'MMM d, yyyy') : null,
          icon: Calendar,
          badge: data?.deaExpirationDate ? (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${new Date(data.deaExpirationDate) > new Date() ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {new Date(data.deaExpirationDate) > new Date() ? 'Valid' : 'Expired'}
            </span>
          ) : null
        },
        { label: 'State License', value: data?.stateLicenseNumber, icon: Shield },
        {
          label: 'State License Expiration',
          value: data?.stateLicenseExpirationDate ? format(new Date(data.stateLicenseExpirationDate), 'MMM d, yyyy') : null,
          icon: Calendar,
          badge: data?.stateLicenseExpirationDate ? (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${new Date(data.stateLicenseExpirationDate) > new Date() ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {new Date(data.stateLicenseExpirationDate) > new Date() ? 'Valid' : 'Expired'}
            </span>
          ) : null
        },
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Business Info Tab
const BusinessInfoTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Briefcase className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
        <p className="text-gray-600">Business type and operational details</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { label: 'Enterprise Type', value: ENTERPRISE_TYPES.find(t => t.value === data?.enterpriseType)?.label || data?.enterpriseType, icon: Building2 },
        { label: 'Pharmacy Type', value: PHARMACY_TYPES.find(t => t.value === data?.pharmacyType)?.label || data?.pharmacyType, icon: Home },
        { label: 'Primary Wholesaler', value: data?.primaryWholesaler, icon: Truck },
        { label: 'Secondary Wholesaler', value: data?.secondaryWholesaler, icon: Truck },
        { label: 'Pharmacy Software', value: data?.pharmacySoftware, icon: Monitor },
        { label: 'Number of Locations', value: data?.numberOfLocations, icon: MapPin },
        { label: 'Hours of Operation', value: data?.hoursOfOperation, icon: Clock, fullWidth: true },
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Bank Account Tab - NEW
const BankAccountTab = ({ data, toggleVisibility, revealedData }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Banknote className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bank Account Details</h2>
        <p className="text-gray-600">Secure bank information for payment processing</p>
      </div>
      <Lock className="h-5 w-5 text-teal-500 ml-4" />
    </div>

    {data ? (
      <>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-emerald-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Secure Information</h3>
          </div>
          <p className="text-gray-700">
            Your bank account information is encrypted and stored securely. Click the eye icon to reveal sensitive data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldCard
            field={{
              label: 'Account Holder Name',
              value: data.accountHolderName,
              icon: User
            }}
          />

          <FieldCard
            field={{
              label: 'Bank Name',
              value: data.bankName,
              icon: Banknote
            }}
          />

          <FieldCard
            field={{
              label: 'Routing Number',
              value: data.maskedRoutingNumber,
              icon: CreditCard
            }}
          />

          <FieldCard
            field={{
              label: 'Account Number',
              value: data.maskedAccountNumber,
              icon: CreditCard
            }}
          />


          <div className="bg-white rounded-xl border border-teal-100 p-5">
            <div className="flex items-center mb-3">
              <Briefcase className="h-5 w-5 text-emerald-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-700">Account Type</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">{data.accountType || '—'}</p>
          </div>

          <div className="bg-white rounded-xl border border-teal-100 p-5">
            <div className="flex items-center mb-3">
              <Phone className="h-5 w-5 text-emerald-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-700">Bank Phone</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">{data.bankPhone || '—'}</p>
          </div>

          {data.achAuthorization && (
            <div className="md:col-span-2 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                <div>
                  <h4 className="font-bold text-gray-900">ACH Authorization Active</h4>
                  {data.authorizationDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Authorized on {format(new Date(data.authorizationDate), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bank Address */}
        {data.bankAddress && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 text-teal-500 mr-3" />
              Bank Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Address Line 1', value: data.bankAddress.line1 },
                { label: 'Address Line 2', value: data.bankAddress.line2 },
                { label: 'City', value: data.bankAddress.city },
                { label: 'State', value: STATES.find(s => s.value === data.bankAddress.state)?.label || data.bankAddress.state },
                { label: 'Zip Code', value: data.bankAddress.zipCode },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="font-semibold text-gray-900 mt-1">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="text-center py-12">
        <Banknote className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No bank account information</h3>
        <p className="text-gray-600 mt-2">Bank account details have not been set up yet.</p>
      </div>
    )}
  </div>
)

// Referral Tab
const ReferralTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <Users className="h-8 w-8 text-emerald-600 mr-3" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Referral Information</h2>
        <p className="text-gray-600">How you found us and promotional details</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Promo Code', value: data?.promoCode, icon: Tag },
        { label: 'Referral Source', value: REFERRAL_SOURCES.find(s => s.value === data?.referralSource)?.label || data?.referralSource, icon: Users },
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}

      <div className={`md:col-span-2 ${data?.termsAccepted ? 'bg-emerald-50' : 'bg-gray-50'} rounded-xl p-6 border ${data?.termsAccepted ? 'border-emerald-200' : 'border-gray-200'}`}>
        <div className="flex items-center">
          {data?.termsAccepted ? (
            <CheckCircle className="h-8 w-8 text-emerald-600 mr-4" />
          ) : (
            <CheckCircle className="h-8 w-8 text-gray-400 mr-4" />
          )}
          <div>
            <h4 className="font-bold text-gray-900">
              {data?.termsAccepted ? 'Terms & Conditions Accepted' : 'Terms & Conditions Not Accepted'}
            </h4>
            {data?.acceptedAt && (
              <p className="text-sm text-gray-600 mt-1">
                Accepted on {format(new Date(data.acceptedAt), 'MMMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Documents Tab
const DocumentsTab = ({ documents }) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <FileText className="h-8 w-8 text-emerald-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Uploaded Documents</h2>
          <p className="text-gray-600">All submitted documents and files</p>
        </div>
      </div>
      {documents?.length > 0 && (
        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>

    {documents?.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, index) => (
          <DocumentCard key={index} doc={doc} index={index} />
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No documents uploaded</h3>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Documents will appear here once uploaded during registration or profile updates.
        </p>
      </div>
    )}
  </div>
)

// Reusable Field Card Component
const FieldCard = ({ field }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-5 hover:border-emerald-200 transition-all duration-300 hover:shadow-sm ${field.fullWidth ? 'md:col-span-3' : ''}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <field.icon className="h-5 w-5 text-emerald-500 mr-2" />
        <h4 className="text-sm font-medium text-gray-700">{field.label}</h4>
      </div>
      {field.badge}
    </div>
    <p className={`text-lg font-semibold ${field.highlight ? 'text-gray-900' : 'text-gray-700'}`}>
      {field.value || '—'}
    </p>
  </div>
)

// Reusable Address Section Component
const AddressSection = ({ title, data, icon: Icon, color }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6">
    <div className="flex items-center mb-6">
      <div className={`p-3 rounded-xl bg-${color}-100 mr-4`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>

    {data ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Address Line 1', value: data.line1 },
          { label: 'Address Line 2', value: data.line2 },
          { label: 'City', value: data.city },
          { label: 'State', value: STATES.find(s => s.value === data.state)?.label || data.state },
          { label: 'Zip Code', value: data.zipCode },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-100">
            <p className="text-sm text-gray-600">{item.label}</p>
            <p className="font-medium text-gray-900 mt-1">{item.value || '—'}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic">No address provided</p>
    )}
  </div>
)

// Reusable Document Card Component
const DocumentCard = ({ doc, index }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start">
      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
        <FileText className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-bold text-gray-900 truncate">{doc.name || `Document ${index + 1}`}</h4>
        {doc.uploadedAt && (
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
          </p>
        )}

        {doc.url && (
          <div className="mt-4 flex space-x-3">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium text-sm transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </a>
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = doc.url
                link.download = doc.name || `document_${index + 1}`
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium text-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)

// Add missing icon imports
const Truck = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const Monitor = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Tag = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

export default ProfilePage