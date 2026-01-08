import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchVendorDetails,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor
} from '../../store/slices/vendorSlice'
import {
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  MoreVertical,
  Download,
  Lock,
  Unlock,
  ExternalLink,
  Clock,
  FileCheck,
  Store,
  Package2,
  Truck,
  BarChart,
  History,
  Globe,
  MapPin as MapPinIcon
} from 'lucide-react'
import { format } from 'date-fns'

const VendorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedVendor, isLoading, error } = useSelector((state) => state.vendors)
  
  const [activeTab, setActiveTab] = useState('info')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [showReactivateModal, setShowReactivateModal] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorDetails(id))
    }
  }, [dispatch, id])

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this vendor?')) {
      dispatch(approveVendor(id))
        .then(() => {
          alert('Vendor approved successfully!')
          dispatch(fetchVendorDetails(id))
        })
        .catch(error => {
          alert(`Error: ${error.message}`)
        })
    }
  }

  const handleReject = () => {
    if (rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (minimum 10 characters)')
      return
    }
    dispatch(rejectVendor({ vendorId: id, rejectionReason }))
      .then(() => {
        alert('Vendor rejected successfully!')
        setShowRejectModal(false)
        setRejectionReason('')
        dispatch(fetchVendorDetails(id))
      })
      .catch(error => {
        alert(`Error: ${error.message}`)
      })
  }

  const handleSuspend = () => {
    if (suspensionReason.trim().length < 5) {
      alert('Please provide a suspension reason (minimum 5 characters)')
      return
    }
    dispatch(suspendVendor({ vendorId: id, reason: suspensionReason }))
      .then(() => {
        alert('Vendor suspended successfully!')
        setShowSuspendModal(false)
        setSuspensionReason('')
        dispatch(fetchVendorDetails(id))
      })
      .catch(error => {
        alert(`Error: ${error.message}`)
      })
  }

  const handleReactivate = () => {
    if (window.confirm('Are you sure you want to reactivate this vendor?')) {
      dispatch(reactivateVendor(id))
        .then(() => {
          alert('Vendor reactivated successfully!')
          setShowReactivateModal(false)
          dispatch(fetchVendorDetails(id))
        })
        .catch(error => {
          alert(`Error: ${error.message}`)
        })
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      approved: { bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800' },
      suspended: { bg: 'bg-gray-100', text: 'text-gray-800' }
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
      suspended: <Lock className="w-3 h-3 mr-1" />
    }
    return icons[status] || <Clock className="w-3 h-3 mr-1" />
  }

  const formatAddress = (address) => {
    if (!address) return 'N/A'
    const parts = [
      address.line1 || address.address1,
      address.line2 || address.address2,
      address.city,
      address.state,
      address.zipCode || address.zip
    ].filter(Boolean)
    return parts.join(', ')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading vendor</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate('/admin/vendors')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendors
        </button>
      </div>
    )
  }

  if (!selectedVendor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested vendor could not be found.</p>
        <button
          onClick={() => navigate('/admin/vendors')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendors
        </button>
      </div>
    )
  }

  const { bg: statusBg, text: statusText } = getStatusColor(selectedVendor.status)
  const StatusIcon = getStatusIcon(selectedVendor.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/vendors')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedVendor.pharmacyInfo?.legalBusinessName || 'Unnamed Vendor'}
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg} ${statusText}`}>
                {StatusIcon}
                {selectedVendor.status?.charAt(0).toUpperCase() + selectedVendor.status?.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                ID: {selectedVendor._id?.slice(-8)}
              </span>
              {selectedVendor.email && (
                <span className="text-sm text-gray-500">
                  • {selectedVendor.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedVendor.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
          {selectedVendor.status === 'approved' && (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Lock className="w-4 h-4 mr-2" />
              Suspend
            </button>
          )}
          {selectedVendor.status === 'suspended' && (
            <button
              onClick={() => setShowReactivateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Reactivate
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <MoreVertical className="w-4 h-4 mr-2" />
            More
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'info', label: 'Information', icon: Store },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'products', label: 'Products', icon: Package2 },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'activity', label: 'Activity', icon: History },
            { id: 'analytics', label: 'Analytics', icon: BarChart }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {/* Information Tab */}
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Business Info */}
              <div className="space-y-6">
                {/* Business Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-gray-500" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Legal Business Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedVendor.pharmacyInfo?.legalBusinessName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">DBA Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.dba || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">NPI Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.npiNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Federal EIN</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.federalEIN || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        Business Address
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatAddress(selectedVendor.pharmacyInfo?.businessAddress || selectedVendor.pharmacyInfo?.shippingAddress)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Owner Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedVendor.pharmacyOwner?.firstName || ''} {selectedVendor.pharmacyOwner?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Title</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.title || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.email || selectedVendor.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Phone
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.phone || selectedVendor.pharmacyOwner?.mobile || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {selectedVendor.primaryContact && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Contact</h4>
                        <p className="text-sm text-gray-900">
                          {selectedVendor.primaryContact?.firstName} {selectedVendor.primaryContact?.lastName}
                          {selectedVendor.primaryContact?.title && ` • ${selectedVendor.primaryContact.title}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedVendor.primaryContact?.email && `${selectedVendor.primaryContact.email} • `}
                          {selectedVendor.primaryContact?.phone || selectedVendor.primaryContact?.mobile}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* License Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-gray-500" />
                    License Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">DEA Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyLicense?.deaNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">DEA Expiration</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyLicense?.deaExpirationDate ? 
                            format(new Date(selectedVendor.pharmacyLicense.deaExpirationDate), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">State License</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyLicense?.stateLicenseNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">License Expiration</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyLicense?.stateLicenseExpirationDate ? 
                            format(new Date(selectedVendor.pharmacyLicense.stateLicenseExpirationDate), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Additional Info */}
              <div className="space-y-6">
                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-gray-500" />
                    Account Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg} ${statusText}`}>
                        {StatusIcon}
                        {selectedVendor.status?.charAt(0).toUpperCase() + selectedVendor.status?.slice(1)}
                      </span>
                    </div>
                    
                    {selectedVendor.registeredAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Registered
                        </span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.registeredAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.approvedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approved Date</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.approvedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.approvedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approved By</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.approvedBy?.firstName} {selectedVendor.approvedBy?.lastName}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.suspendedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Suspended Date</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.suspendedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.suspensionReason && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Suspension Reason</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.suspensionReason}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.lastLoginAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Login</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.lastLoginAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Store className="w-5 h-5 mr-2 text-gray-500" />
                    Business Details
                  </h3>
                  <div className="space-y-3">
                    {selectedVendor.pharmacyQuestions?.enterpriseType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Enterprise Type</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.enterpriseType}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.pharmacyType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pharmacy Type</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.pharmacyType}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.numberOfLocations && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Number of Locations</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.numberOfLocations}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.pharmacySoftware && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pharmacy Software</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.pharmacySoftware}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.primaryWholesaler && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Primary Wholesaler</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.primaryWholesaler}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-900">Total Sales</p>
                        <p className="text-xl font-semibold text-blue-900">$12,458</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm text-green-900">Total Orders</p>
                        <p className="text-xl font-semibold text-green-900">156</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Info */}
                {selectedVendor.referralInfo && (
                  <div className="bg-purple-50 rounded-lg p-5">
                    <h3 className="text-lg font-medium text-purple-900 mb-3">Referral Information</h3>
                    <div className="space-y-2">
                      {selectedVendor.referralInfo.referralSource && (
                        <div className="flex justify-between">
                          <span className="text-sm text-purple-700">Source</span>
                          <span className="text-sm font-medium text-purple-900">{selectedVendor.referralInfo.referralSource}</span>
                        </div>
                      )}
                      {selectedVendor.referralInfo.promoCode && (
                        <div className="flex justify-between">
                          <span className="text-sm text-purple-700">Promo Code</span>
                          <span className="text-sm font-medium text-purple-900">{selectedVendor.referralInfo.promoCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Documents & Licenses</h3>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedVendor.documents && selectedVendor.documents.length > 0 ? (
                selectedVendor.documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.name || doc.documentType || `Document ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploaded: {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : 'Recently'}
                        </p>
                        <div className="mt-3 flex items-center space-x-3">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </a>
                          )}
                          {doc.url && (
                            <a
                              href={doc.url}
                              download
                              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The vendor has not uploaded any documents.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-6">
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Order Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                This feature will be available soon. Integration with order system is in progress.
              </p>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Product Catalog</h3>
              <p className="mt-1 text-sm text-gray-500">
                Product management system will be integrated in the next release.
              </p>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="p-6">
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Transaction History</h3>
              <p className="mt-1 text-sm text-gray-500">
                Payment gateway integration is required for this feature.
              </p>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6">
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Activity Log</h3>
              <p className="mt-1 text-sm text-gray-500">
                Activity tracking will be enabled in future updates.
              </p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="text-center py-12">
              <BarChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor Analytics</h3>
              <p className="mt-1 text-sm text-gray-500">
                Analytics dashboard is under development.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Vendor</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide a detailed reason for rejection:
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed rejection reason (minimum 10 characters)..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {rejectionReason.length}/10 characters minimum
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectionReason.trim().length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suspend Vendor</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide a reason for suspension:
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter suspension reason (minimum 5 characters)..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {suspensionReason.length}/5 characters minimum
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false)
                  setSuspensionReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspensionReason.trim().length < 5}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal */}
      {showReactivateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reactivate Vendor</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reactivate this vendor? This will restore their account access immediately.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReactivateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Confirm Reactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDetailPage