import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchPendingVendors,
  approveVendor,
  rejectVendor,
  fetchVendors
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
  Download,
  Users,
  RefreshCw,
  Filter,
  ChevronDown,
  FileCheck,
  UserCheck
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const VendorApprovalPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { vendors, pagination, isLoading, error } = useSelector((state) => state.vendors)
  
  const [search, setSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchPendingVendors({ page: 1, limit: 10 }))
  }, [dispatch])

  // Ensure vendors is always an array
  const vendorsArray = Array.isArray(vendors) ? vendors : []

  const handleApprove = (vendorId, vendorName) => {
    if (window.confirm(`Are you sure you want to approve ${vendorName || 'this vendor'}?`)) {
      dispatch(approveVendor(vendorId))
        .then(() => {
          alert('Vendor approved successfully!')
          // Refresh the list
          dispatch(fetchPendingVendors({ page: 1, limit: 10 }))
        })
        .catch(error => {
          alert(`Error: ${error.message}`)
        })
    }
  }

  const handleReject = (vendorId) => {
    setSelectedVendor(vendorId)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (minimum 10 characters)')
      return
    }
    
    dispatch(rejectVendor({ vendorId: selectedVendor, rejectionReason }))
      .then(() => {
        alert('Vendor rejected successfully!')
        setShowRejectModal(false)
        setRejectionReason('')
        setSelectedVendor(null)
        // Refresh the list
        dispatch(fetchPendingVendors({ page: 1, limit: 10 }))
      })
      .catch(error => {
        alert(`Error: ${error.message}`)
      })
  }

  const viewDetails = (vendorId) => {
    navigate(`/admin/vendors/${vendorId}`)
  }

  const refreshList = () => {
    dispatch(fetchPendingVendors({ page: 1, limit: 10 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // You can implement search logic here or just filter the current list
  }

  const filteredVendors = vendorsArray.filter(vendor => {
    // Filter by search term
    const searchLower = search.toLowerCase()
    const matchesSearch = 
      vendor.pharmacyInfo?.legalBusinessName?.toLowerCase().includes(searchLower) ||
      vendor.pharmacyOwner?.email?.toLowerCase().includes(searchLower) ||
      vendor.email?.toLowerCase().includes(searchLower) ||
      vendor.pharmacyInfo?.npiNumber?.toLowerCase().includes(searchLower) ||
      vendor.pharmacyLicense?.deaNumber?.toLowerCase().includes(searchLower) ||
      false

    // Filter by date
    let matchesDate = true
    if (dateFilter !== 'all' && vendor.registeredAt) {
      const vendorDate = new Date(vendor.registeredAt)
      const today = new Date()
      const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7))
      
      switch(dateFilter) {
        case 'today':
          matchesDate = new Date(vendorDate.toDateString()) === new Date(new Date().toDateString())
          break
        case 'week':
          matchesDate = vendorDate >= sevenDaysAgo
          break
        case 'month':
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1))
          matchesDate = vendorDate >= monthAgo
          break
        default:
          matchesDate = true
      }
    }

    return matchesSearch && matchesDate
  })

  // Calculate stats
  const stats = {
    totalPending: vendorsArray.length,
    today: vendorsArray.filter(v => {
      const today = new Date()
      const vendorDate = new Date(v.registeredAt || v.createdAt)
      return vendorDate.toDateString() === today.toDateString()
    }).length,
    awaitingDocs: vendorsArray.filter(v => !v.documents || v.documents.length === 0).length,
    withCompleteDocs: vendorsArray.filter(v => v.documents && v.documents.length >= 3).length
  }

  // Get vendor display info
  const getVendorDisplayInfo = (vendor) => {
    return {
      name: vendor.pharmacyInfo?.legalBusinessName || 
            vendor.pharmacyInfo?.name || 
            'Unnamed Vendor',
      email: vendor.pharmacyOwner?.email || 
             vendor.email || 
             'No email',
      npi: vendor.pharmacyInfo?.npiNumber || 
           'Not provided',
      dea: vendor.pharmacyLicense?.deaNumber || 
           'Not provided',
      documentsCount: vendor.documents?.length || 0,
      registeredDate: vendor.registeredAt || vendor.createdAt,
      contactName: `${vendor.pharmacyOwner?.firstName || ''} ${vendor.pharmacyOwner?.lastName || ''}`.trim() || 'Unknown',
      contactPhone: vendor.pharmacyOwner?.phone || 
                   vendor.pharmacyOwner?.mobile || 
                   'No phone'
    }
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
          <button
            onClick={refreshList}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Awaiting Docs</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.awaitingDocs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-100 p-3 rounded-full">
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Complete Docs</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.withCompleteDocs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by business name, email, NPI, DEA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All dates</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents Status
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="pending">All pending</option>
                  <option value="with_docs">With documents</option>
                  <option value="no_docs">No documents</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('')
                    setDateFilter('all')
                    setStatusFilter('pending')
                  }}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Vendors Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading vendors</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={refreshList}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="overflow-x-auto">
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
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => {
                  const vendorInfo = getVendorDisplayInfo(vendor)
                  
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
                              {vendorInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vendorInfo.email}
                            </div>
                            <div className="flex space-x-2 mt-1">
                              <span className="text-xs text-gray-400">
                                NPI: {vendorInfo.npi}
                              </span>
                              <span className="text-xs text-gray-400">
                                • DEA: {vendorInfo.dea}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className={`h-4 w-4 mr-2 ${vendorInfo.documentsCount > 0 ? 'text-green-500' : 'text-red-500'}`} />
                          <div>
                            <div className="text-sm text-gray-900">
                              {vendorInfo.documentsCount} document{vendorInfo.documentsCount !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vendorInfo.documentsCount === 0 ? 'Awaiting documents' : 'Ready for review'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vendorInfo.registeredDate ? (
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {format(new Date(vendorInfo.registeredDate), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(vendorInfo.registeredDate), { addSuffix: true })}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {vendorInfo.contactName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vendorInfo.contactPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => viewDetails(vendor._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApprove(vendor._id, vendorInfo.name)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(vendor._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{pagination.page * pagination.limit - pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => dispatch(fetchPendingVendors({ page: pagination.page - 1, limit: 10 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => dispatch(fetchPendingVendors({ page: pagination.page + 1, limit: 10 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || dateFilter !== 'all' || statusFilter !== 'pending'
                ? 'No vendors match your current filters.'
                : 'All vendor applications have been reviewed.'}
            </p>
            {(search || dateFilter !== 'all' || statusFilter !== 'pending') && (
              <button
                onClick={() => {
                  setSearch('')
                  setDateFilter('all')
                  setStatusFilter('pending')
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Clear filters
              </button>
            )}
          </div>
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