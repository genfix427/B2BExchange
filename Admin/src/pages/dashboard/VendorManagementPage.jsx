import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchVendors,
  setFilters,
  clearFilters
} from '../../store/slices/vendorSlice'
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  Download,
  RefreshCw,
  UserPlus,
  Calendar
} from 'lucide-react'
import {
  formatDistanceToNow,
  format
} from 'date-fns'

const VendorManagementPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { vendors, pagination, isLoading, filters } = useSelector(
    (state) => state.vendors
  )

  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all')
  const [searchQuery, setSearchQuery] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchVendors(filters))
  }, [dispatch, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchQuery, status: selectedStatus }))
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    dispatch(setFilters({ status, page: 1 }))
  }

  const handleClearFilters = () => {
    setSelectedStatus('all')
    setSearchQuery('')
    dispatch(clearFilters())
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <AlertCircle className="w-4 h-4" />,
        bg: 'bg-yellow-100 text-yellow-800',
        text: 'Pending'
      },
      approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: 'bg-green-100 text-green-800',
        text: 'Approved'
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" />,
        bg: 'bg-red-100 text-red-800',
        text: 'Rejected'
      },
      suspended: {
        icon: <PauseCircle className="w-4 h-4" />,
        bg: 'bg-gray-100 text-gray-800',
        text: 'Suspended'
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </span>
    )
  }

  const viewVendorDetails = (vendorId) => {
    navigate(`/admin/vendors/${vendorId}`)
  }

  // FIX: Add safety checks for vendors array
  const vendorsArray = Array.isArray(vendors) ? vendors : []

  // FIX: Safe stats calculation
  const stats = {
    total: vendorsArray.length,
    approved: vendorsArray.filter(v => v && v.status === 'approved').length,
    pending: vendorsArray.filter(v => v && v.status === 'pending').length,
    suspended: vendorsArray.filter(v => v && v.status === 'suspended').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all vendor accounts and their status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => dispatch(fetchVendors(filters))}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Vendors
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.total}
                  </dd>
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
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Approved
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.approved}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gray-100 p-3 rounded-full">
                  <PauseCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Suspended
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.suspended}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search vendors by name, email, NPI, DEA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option>Date Registered</option>
                  <option>Business Name</option>
                  <option>Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
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
                        Vendor Info
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendorsArray.map((vendor) => {
                      // Safely access vendor properties
                      if (!vendor) return null

                      const businessName = vendor.pharmacyInfo?.legalBusinessName ||
                        vendor.pharmacyInfo?.name ||
                        'N/A'

                      const npiNumber = vendor.pharmacyInfo?.npiNumber || 'Not provided'
                      const email = vendor.pharmacyOwner?.email || vendor.email || 'N/A'
                      const phone = vendor.pharmacyOwner?.phone || vendor.primaryContact?.phone || 'No phone'
                      const registeredDate = vendor.registeredAt || vendor.createdAt

                      return (
                        <tr key={vendor._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {businessName?.charAt(0) || 'V'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {businessName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  NPI: {npiNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(vendor.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {registeredDate ? (
                                <>
                                  <span>{format(new Date(registeredDate), 'MMM d, yyyy')}</span>
                                  <span className="ml-2 text-gray-400">
                                    ({formatDistanceToNow(new Date(registeredDate), { addSuffix: true })})
                                  </span>
                                </>
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => viewVendorDetails(vendor._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-5 h-5" />
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
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No vendors registered yet'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && vendorsArray.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination || pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination || pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination?.page - 1) * pagination?.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination?.page * pagination?.limit, pagination?.total || 0)}
                    </span>{' '}
                    of <span className="font-medium">{pagination?.total || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {pagination?.pages && Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorManagementPage