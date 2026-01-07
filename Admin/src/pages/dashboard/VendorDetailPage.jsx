import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchVendorDetails,
  approveVendor,
  rejectVendor
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
  Edit,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'

const VendorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedVendor, isLoading } = useSelector((state) => state.vendors)
  const [activeTab, setActiveTab] = useState('info')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorDetails(id))
    }
  }, [dispatch, id])

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this vendor?')) {
      dispatch(approveVendor(id))
    }
  }

  const handleReject = () => {
    if (rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (min 10 characters)')
      return
    }
    dispatch(rejectVendor({ vendorId: id, rejectionReason }))
    setShowRejectModal(false)
    setRejectionReason('')
  }

  const handleStatusChange = (status) => {
    setNewStatus(status)
    setShowStatusModal(true)
  }

  const confirmStatusChange = () => {
    // Here you would dispatch an action to update vendor status
    // For now, just show alert
    alert(`Status changed to ${newStatus}`)
    setShowStatusModal(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || colors.pending
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!selectedVendor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor not found</h3>
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
              {selectedVendor.pharmacyInfo?.legalBusinessName}
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedVendor.status)}`}>
                {selectedVendor.status?.charAt(0).toUpperCase() + selectedVendor.status?.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Vendor ID: {selectedVendor._id?.slice(-8)}
              </span>
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
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <MoreVertical className="w-4 h-4 mr-2" />
            More Actions
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['info', 'orders', 'products', 'transactions', 'documents', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Business Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-gray-400" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Legal Business Name</label>
                        <p className="mt-1 text-sm text-gray-900">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">NPI Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.npiNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">DEA Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyLicense?.deaNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Business Address</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedVendor.pharmacyInfo?.businessAddress?.address1 || 'N/A'}
                        {selectedVendor.pharmacyInfo?.businessAddress?.address2 && `, ${selectedVendor.pharmacyInfo.businessAddress.address2}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedVendor.pharmacyInfo?.businessAddress?.city || ''}{', '}
                        {selectedVendor.pharmacyInfo?.businessAddress?.state || ''}{' '}
                        {selectedVendor.pharmacyInfo?.businessAddress?.zipCode || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-400" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Owner Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.firstName || ''}{' '}
                          {selectedVendor.pharmacyOwner?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Title</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.title || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Phone
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Actions */}
              <div className="space-y-6">
                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-gray-400" />
                    Account Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedVendor.status)}`}>
                        {selectedVendor.status?.toUpperCase()}
                      </span>
                    </div>
                    
                    {selectedVendor.approvedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Approved Date</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.approvedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.approvedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Approved By</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.approvedBy?.firstName} {selectedVendor.approvedBy?.lastName}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.registeredAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Registered Date
                        </span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.registeredAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Actions */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Account Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVendor.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange('approved')}
                          className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                      )}
                      {selectedVendor.status !== 'suspended' && (
                        <button
                          onClick={() => handleStatusChange('suspended')}
                          className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Suspend
                        </button>
                      )}
                      {selectedVendor.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusChange('reactivate')}
                          className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Reactivate
                        </button>
                      )}
                      {selectedVendor.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange('rejected')}
                          className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      )}
                    </div>
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

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'Account created', date: selectedVendor.registeredAt },
                      { action: 'Documents uploaded', date: new Date(Date.now() - 86400000) },
                      { action: 'Profile updated', date: new Date(Date.now() - 172800000) }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{activity.action}</span>
                        <span className="text-gray-400">
                          {activity.date ? format(new Date(activity.date), 'MMM d') : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {activeTab === 'products' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Product Catalog</h3>
              <p className="mt-1 text-sm text-gray-500">
                Product management system will be integrated in the next release.
              </p>
            </div>
          </div>
        )}

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
              {selectedVendor.documents?.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{doc.documentType}</p>
                      <p className="text-sm text-gray-500">Uploaded: {format(new Date(), 'MMM d, yyyy')}</p>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                        <ExternalLink className="w-4 h-4 inline mr-1" />
                        View Document
                      </button>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="col-span-3 text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                </div>
              )}
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
                onClick={() => setShowRejectModal(false)}
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

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Vendor Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to change this vendor's status to <strong>{newStatus.toUpperCase()}</strong>?
            </p>
            {newStatus === 'rejected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection:
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Optional: Enter rejection reason..."
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDetailPage