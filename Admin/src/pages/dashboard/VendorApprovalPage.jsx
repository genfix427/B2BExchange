import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchPendingVendors,
  approveVendor,
  rejectVendor
} from '../../store/slices/vendorSlice'
import {
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Calendar,
  Clock,
  Download
} from 'lucide-react'
import { format } from 'date-fns'

const VendorApprovalPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { vendors, pagination, isLoading } = useSelector((state) => state.vendors)
  const [search, setSearch] = React.useState('')
  const [selectedVendor, setSelectedVendor] = React.useState(null)
  const [showRejectModal, setShowRejectModal] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')

  useEffect(() => {
    dispatch(fetchPendingVendors({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleApprove = (vendorId) => {
    if (window.confirm('Are you sure you want to approve this vendor?')) {
      dispatch(approveVendor(vendorId))
    }
  }

  const handleReject = (vendorId) => {
    setSelectedVendor(vendorId)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (min 10 characters)')
      return
    }
    dispatch(rejectVendor({ vendorId: selectedVendor, rejectionReason }))
    setShowRejectModal(false)
    setRejectionReason('')
    setSelectedVendor(null)
  }

  const viewDetails = (vendorId) => {
    navigate(`/admin/vendors/${vendorId}`)
  }

  // Fix: Check if vendors exists and is an array
  const vendorsArray = Array.isArray(vendors) ? vendors : []
  
  const stats = {
    totalPending: vendorsArray.length,
    today: vendorsArray.filter(v => {
      const today = new Date()
      const vendorDate = new Date(v.registeredAt || v.createdAt)
      return vendorDate.toDateString() === today.toDateString()
    }).length,
    awaitingDocs: vendorsArray.filter(v => !v.documents || v.documents.length === 0).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Approval</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve pending vendor applications
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.totalPending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Applications</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.today}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Awaiting Documents</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.awaitingDocs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search pending applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pending Vendors Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {vendorsArray.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorsArray
                    .filter(vendor =>
                      vendor.pharmacyInfo?.legalBusinessName?.toLowerCase().includes(search.toLowerCase()) ||
                      vendor.pharmacyOwner?.email?.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((vendor) => {
                      // Safely access vendor properties
                      const businessName = vendor.pharmacyInfo?.legalBusinessName || 
                                          vendor.pharmacyInfo?.name || 
                                          'N/A'
                      
                      const email = vendor.pharmacyOwner?.email || 
                                   vendor.email || 
                                   'N/A'
                      
                      const npiNumber = vendor.pharmacyInfo?.npiNumber || 
                                       'Not provided'
                      
                      const documentsCount = vendor.documents?.length || 0
                      const registeredDate = vendor.registeredAt || vendor.createdAt

                      return (
                        <tr key={vendor._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {businessName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {email}
                                </div>
                                <div className="text-xs text-gray-400">
                                  NPI: {npiNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {documentsCount} document{documentsCount !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              {documentsCount === 0 ? 'No documents uploaded' : 'Documents available'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registeredDate ? (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {format(new Date(registeredDate), 'MMM d, yyyy')}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => viewDetails(vendor._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleApprove(vendor._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(vendor._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All vendor applications have been reviewed.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Vendor Application</h3>
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
                  setSelectedVendor(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejectionReason.trim().length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorApprovalPage