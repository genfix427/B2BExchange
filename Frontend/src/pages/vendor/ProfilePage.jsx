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
  FileUp,
  Edit2,
  Download,
  ExternalLink,
  Eye,
  ChevronRight,
  Info,
  Clock,
  Globe,
  Home,
  Briefcase,
  Award,
  Star,
  Heart,
  Sparkles
} from 'lucide-react'
import { STATES, TIMEZONES, ENTERPRISE_TYPES, PHARMACY_TYPES, REFERRAL_SOURCES } from '../../utils/constants'
import { format } from 'date-fns'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { fetchVendorProfile } from '../../store/slices/vendorSlice'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user: authUser, isLoading: authLoading } = useSelector((state) => state.auth)
  const { profile: vendorProfile, isLoading: vendorLoading } = useSelector((state) => state.vendor)

  const [activeTab, setActiveTab] = useState('pharmacy-info')
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const tabs = [
    { id: 'pharmacy-info', label: 'Pharmacy Info', icon: Building2, color: 'text-blue-500' },
    { id: 'pharmacy-owner', label: 'Pharmacy Owner', icon: User, color: 'text-purple-500' },
    { id: 'primary-contact', label: 'Primary Contact', icon: Phone, color: 'text-green-500' },
    { id: 'license', label: 'License Info', icon: Shield, color: 'text-red-500' },
    { id: 'business-info', label: 'Business Info', icon: CreditCard, color: 'text-amber-500' },
    { id: 'referral', label: 'Referral Info', icon: Users, color: 'text-indigo-500' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'text-cyan-500' }
  ]

  // Fetch vendor profile on component mount
  useEffect(() => {
    if (authUser && !vendorProfile) {
      dispatch(fetchVendorProfile())
    }
  }, [dispatch, authUser, vendorProfile])

  // Use vendor profile if available, otherwise use auth user data
  const user = vendorProfile || authUser

  if (authLoading || vendorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative">
            <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-800">No profile data</h3>
          <p className="mt-2 text-gray-600">Please login to view your profile.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'from-green-400 to-emerald-500'
      case 'pending': return 'from-amber-400 to-yellow-500'
      case 'suspended': return 'from-red-400 to-rose-500'
      default: return 'from-gray-400 to-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 mt-20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative space-y-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 p-6 md:p-8 transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-tr-full"></div>

          <div className="relative flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-3">
                    <Building2 className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="ml-6">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                      {user.pharmacyInfo?.legalBusinessName || 'Pharmacy Name'}
                    </h1>
                    {user.status === 'approved' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-lg text-gray-600">
                    {user.pharmacyInfo?.dba || 'Doing Business As'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusColor(user.status)} rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
                  <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Status: {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                  </span>
                </div>

                {user.approvedAt && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-medium">
                      <Award className="h-4 w-4 mr-2" />
                      Approved: {format(new Date(user.approvedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {user.registeredAt && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-slate-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-medium">
                      <Clock className="h-4 w-4 mr-2" />
                      Registered: {format(new Date(user.registeredAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {user.email && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-medium">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center px-6 py-3 bg-white rounded-lg font-medium text-gray-900 transition-all duration-300 group-hover:bg-gray-50">
                  <Edit2 className="h-5 w-5 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  <ChevronRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {user.profileCompleted && (
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-medium rounded-full inline-flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Profile completed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Tabs Navigation */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <nav className="flex space-x-1 overflow-x-auto py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => setIsHovered(tab.id)}
                    onMouseLeave={() => setIsHovered(null)}
                    className={`relative px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                  >
                    <tab.icon className={`h-5 w-5 mr-2 ${tab.color} transition-transform duration-300 ${isHovered === tab.id ? 'scale-110' : ''
                      }`} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Enhanced Tab Content */}
            <div className="p-4 md:p-6">
              <div className="relative">
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
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

// Enhanced Pharmacy Info Tab Component
const PharmacyInfoTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Pharmacy Information
        </h3>
        <p className="text-gray-600 mt-1">Basic pharmacy details and contact information</p>
      </div>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        <Info className="h-6 w-6 text-blue-500" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { label: 'NPI Number', value: data?.npiNumber, icon: Briefcase, color: 'text-blue-500' },
        { label: 'Legal Business Name', value: data?.legalBusinessName, icon: Building2, color: 'text-indigo-500' },
        { label: 'DBA (Doing Business As)', value: data?.dba, icon: FileText, color: 'text-purple-500' },
        { label: 'Phone', value: data?.phone, icon: Phone, color: 'text-green-500' },
        { label: 'Fax', value: data?.fax, icon: Phone, color: 'text-gray-500' },
        { label: 'Federal EIN', value: data?.federalEIN, icon: CreditCard, color: 'text-red-500' },
        { label: 'State Tax ID', value: data?.stateTaxID, icon: Shield, color: 'text-amber-500' },
        { label: 'GLN', value: data?.gln, icon: Award, color: 'text-cyan-500' },
        {
          label: 'Timezone',
          value: TIMEZONES.find(t => t.value === data?.timezone)?.label || data?.timezone,
          icon: Globe,
          color: 'text-teal-500'
        }
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>

    {/* Enhanced Address Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AddressSection
        title="Shipping Address"
        data={data?.shippingAddress}
        icon={MapPin}
        iconColor="text-blue-500"
        gradient="from-blue-50 to-blue-100"
      />

      <AddressSection
        title="Mailing Address"
        data={data?.mailingAddress}
        icon={Mail}
        iconColor="text-purple-500"
        gradient="from-purple-50 to-purple-100"
      />
    </div>
  </div>
)

// Enhanced Pharmacy Owner Tab Component
const PharmacyOwnerTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mr-4">
        <User className="h-8 w-8 text-purple-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Pharmacy Owner Information</h3>
        <p className="text-gray-600">Owner details and contact information</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'First Name', value: data?.firstName, icon: User, color: 'text-purple-500' },
        { label: 'Last Name', value: data?.lastName, icon: User, color: 'text-purple-600' },
        { label: 'Mobile Number', value: data?.mobile, icon: Phone, color: 'text-green-500' },
        { label: 'Email', value: data?.email, icon: Mail, color: 'text-blue-500' }
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Enhanced Primary Contact Tab Component
const PrimaryContactTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl mr-4">
        <Phone className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Primary Contact Information</h3>
        <p className="text-gray-600">Main point of contact for the pharmacy</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Title', value: data?.title, icon: Briefcase, color: 'text-gray-600' },
        { label: 'First Name', value: data?.firstName, icon: User, color: 'text-blue-500' },
        { label: 'Last Name', value: data?.lastName, icon: User, color: 'text-blue-600' },
        { label: 'Mobile Number', value: data?.mobile, icon: Phone, color: 'text-green-500' },
        { label: 'Email', value: data?.email, icon: Mail, color: 'text-purple-500' }
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Enhanced License Tab Component
const LicenseTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <div className="p-3 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl mr-4">
        <Shield className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Pharmacy License Information</h3>
        <p className="text-gray-600">License details and expiration dates</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        {
          label: 'DEA Registration Number',
          value: data?.deaNumber,
          icon: Shield,
          color: 'text-red-500',
          highlight: true
        },
        {
          label: 'DEA Expiration Date',
          value: data?.deaExpirationDate ? format(new Date(data.deaExpirationDate), 'MMM d, yyyy') : null,
          icon: Calendar,
          color: new Date(data?.deaExpirationDate) > new Date() ? 'text-green-500' : 'text-red-500',
          badge: data?.deaExpirationDate ? (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${new Date(data.deaExpirationDate) > new Date()
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}>
              {new Date(data.deaExpirationDate) > new Date() ? 'Valid' : 'Expired'}
            </span>
          ) : null
        },
        {
          label: 'State License Number',
          value: data?.stateLicenseNumber,
          icon: Shield,
          color: 'text-blue-500',
          highlight: true
        },
        {
          label: 'State License Expiration Date',
          value: data?.stateLicenseExpirationDate ? format(new Date(data.stateLicenseExpirationDate), 'MMM d, yyyy') : null,
          icon: Calendar,
          color: new Date(data?.stateLicenseExpirationDate) > new Date() ? 'text-green-500' : 'text-red-500',
          badge: data?.stateLicenseExpirationDate ? (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${new Date(data.stateLicenseExpirationDate) > new Date()
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}>
              {new Date(data.stateLicenseExpirationDate) > new Date() ? 'Valid' : 'Expired'}
            </span>
          ) : null
        }
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Enhanced Business Info Tab Component
const BusinessInfoTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl mr-4">
        <CreditCard className="h-8 w-8 text-amber-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Business Information</h3>
        <p className="text-gray-600">Business type and operational details</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        {
          label: 'Enterprise Type',
          value: ENTERPRISE_TYPES.find(t => t.value === data?.enterpriseType)?.label || data?.enterpriseType,
          icon: Building2,
          color: 'text-blue-500'
        },
        {
          label: 'Pharmacy Type',
          value: PHARMACY_TYPES.find(t => t.value === data?.pharmacyType)?.label || data?.pharmacyType,
          icon: Home,
          color: 'text-green-500'
        },
        { label: 'Primary Wholesaler', value: data?.primaryWholesaler, icon: Truck, color: 'text-indigo-500' },
        { label: 'Secondary Wholesaler', value: data?.secondaryWholesaler, icon: Truck, color: 'text-purple-500' },
        { label: 'Pharmacy Software', value: data?.pharmacySoftware, icon: Monitor, color: 'text-cyan-500' },
        { label: 'Number of Locations', value: data?.numberOfLocations, icon: MapPin, color: 'text-red-500', highlight: true },
        {
          label: 'Hours of Operation',
          value: data?.hoursOfOperation,
          icon: Clock,
          color: 'text-gray-600',
          fullWidth: true
        }
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}
    </div>
  </div>
)

// Enhanced Referral Tab Component
const ReferralTab = ({ data }) => (
  <div className="space-y-8">
    <div className="flex items-center">
      <div className="p-3 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl mr-4">
        <Users className="h-8 w-8 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Referral Information</h3>
        <p className="text-gray-600">How you found us and promotional details</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: 'Promo Code', value: data?.promoCode, icon: Tag, color: 'text-purple-500', highlight: true },
        {
          label: 'How did you hear about us?',
          value: REFERRAL_SOURCES.find(s => s.value === data?.referralSource)?.label || data?.referralSource,
          icon: Users,
          color: 'text-blue-500'
        }
      ].map((field, index) => (
        <FieldCard key={index} field={field} />
      ))}

      {/* Terms Acceptance Card */}
      <div className={`md:col-span-2 relative group ${data?.termsAccepted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-gray-50 to-slate-50'
        } rounded-xl p-6 border ${data?.termsAccepted ? 'border-green-200' : 'border-gray-200'
        } transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${data?.termsAccepted ? 'bg-green-100' : 'bg-gray-100'
            } mr-4`}>
            {data?.termsAccepted ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
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

// Enhanced Documents Tab Component
const DocumentsTab = ({ documents }) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Uploaded Documents</h3>
        <p className="text-gray-600">All submitted documents and files</p>
      </div>
      <div className="text-sm text-gray-500">
        {documents?.length || 0} document{documents?.length !== 1 ? 's' : ''}
      </div>
    </div>

    {documents && documents.length > 0 ? (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <DocumentCard key={index} doc={doc} index={index} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              // Implement download all functionality
              alert('Download all documents feature coming soon')
            }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center px-6 py-3 bg-white rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-all duration-300">
              <Download className="h-5 w-5 mr-2" />
              Download All Documents
              <ChevronRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </>
    ) : (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">No documents uploaded</h3>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          Documents will appear here once uploaded during registration or profile updates.
        </p>
      </div>
    )}

    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-start">
        <HelpCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
        <div className="ml-4">
          <h4 className="font-bold text-gray-900">Need help with documents?</h4>
          <p className="text-sm text-gray-700 mt-1">
            These are the documents you submitted during registration. If you need to update any documents,
            please contact our support team at{' '}
            <a href="mailto:support@medicalmarketplace.com" className="text-blue-600 hover:text-blue-800 font-medium">
              support@medicalmarketplace.com
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
)

// Reusable Field Card Component
const FieldCard = ({ field }) => (
  <div className={`relative group ${field.fullWidth ? 'md:col-span-3' : ''}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
    <div className="relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <field.icon className={`h-5 w-5 ${field.color}`} />
        {field.badge}
      </div>
      <h4 className="text-sm font-medium text-gray-500 mb-2">{field.label}</h4>
      <p className={`text-lg font-semibold ${field.highlight ? 'text-gray-900' : 'text-gray-700'}`}>
        {field.value || '—'}
      </p>
    </div>
  </div>
)

// Reusable Address Section Component
const AddressSection = ({ title, data, icon: Icon, iconColor, gradient }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl border border-gray-200 p-6`}>
      <div className="flex items-center mb-6">
        <div className={`p-3 rounded-lg bg-white mr-4`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h4 className="text-xl font-bold text-gray-900">{title}</h4>
      </div>

      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Address Line 1', value: data.line1 },
            { label: 'Address Line 2', value: data.line2 },
            { label: 'City', value: data.city },
            {
              label: 'State',
              value: STATES.find(s => s.value === data?.state)?.label || data?.state
            },
            { label: 'Zip Code', value: data.zipCode },
            ...(data.isSameAsShipping !== undefined ? [
              { label: 'Same as Shipping', value: data.isSameAsShipping ? 'Yes' : 'No' }
            ] : [])
          ].map((item, idx) => (
            <div key={idx} className="bg-white/50 rounded-lg p-3 hover:bg-white/80 transition-colors">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-medium text-gray-900 mt-1">{item.value || '—'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No address provided</p>
      )}
    </div>
  </div>
)

// Reusable Document Card Component
const DocumentCard = ({ doc, index }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
    <div className="relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-30"></div>
          <div className="relative p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h4 className="font-bold text-gray-900 truncate">{doc.name || `Document ${index + 1}`}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : '—'}
          </p>

          {doc.url && (
            <div className="mt-4 flex space-x-3">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm transition-colors"
                title="View Document"
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
                title="Download Document"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          )}
        </div>
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