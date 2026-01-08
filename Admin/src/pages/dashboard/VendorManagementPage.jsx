import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchVendors,
  setFilters,
  clearFilters,
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
  Calendar,
  Users,
  Building,
  Mail,
  Phone,
  ArrowUpDown,
  Check,
  X,
  Clock,
  Shield,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Share2,
  Printer,
  MessageSquare,
  Bell,
  Tag,
  Percent
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const VendorManagementPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { vendors, pagination, isLoading, error, filters, lastUpdated } = useSelector(
    (state) => state.vendors
  )

  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all')
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [sortBy, setSortBy] = useState('registeredAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedVendors, setSelectedVendors] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Ensure vendors is an array
  const vendorsArray = Array.isArray(vendors) ? vendors : []

  useEffect(() => {
    const currentFilters = {
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: searchQuery || undefined,
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      sortOrder
    }

    console.log('Fetching vendors with filters:', currentFilters)
    dispatch(fetchVendors(currentFilters))
  }, [dispatch, selectedStatus, searchQuery, pagination.page, sortBy, sortOrder])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchQuery, status: selectedStatus, page: 1 }))
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    dispatch(setFilters({ status, page: 1 }))
    setSelectedVendors([])
    setShowBulkActions(false)
  }

  const handleClearFilters = () => {
    setSelectedStatus('all')
    setSearchQuery('')
    setSortBy('registeredAt')
    setSortOrder('desc')
    dispatch(clearFilters())
    setSelectedVendors([])
    setShowBulkActions(false)
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }))
    setSelectedVendors([])
    setShowBulkActions(false)
  }

  const handleRefresh = () => {
    dispatch(refreshVendors({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: searchQuery || undefined,
      page: pagination.page,
      limit: pagination.limit
    }))
    setSelectedVendors([])
    setShowBulkActions(false)
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    dispatch(setFilters({ page: 1 }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
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
    console.log('Navigating to vendor details:', vendorId)
    navigate(`/admin/vendors/${vendorId}`)
  }

  const handleVendorSelect = (vendorId) => {
    setSelectedVendors(prev => {
      const newSelection = prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]

      setShowBulkActions(newSelection.length > 0)
      return newSelection
    })
  }

  const handleSelectAll = () => {
    if (selectedVendors.length === vendorsArray.length) {
      setSelectedVendors([])
      setShowBulkActions(false)
    } else {
      const allIds = vendorsArray.map(v => v._id).filter(id => id)
      setSelectedVendors(allIds)
      setShowBulkActions(true)
    }
  }

  const handleBulkApprove = () => {
    if (window.confirm(`Are you sure you want to approve ${selectedVendors.length} vendor(s)?`)) {
      // Implement bulk approve logic
      alert(`Approved ${selectedVendors.length} vendor(s)`)
      setSelectedVendors([])
      setShowBulkActions(false)
      handleRefresh()
    }
  }

  const handleBulkReject = () => {
    if (window.confirm(`Are you sure you want to reject ${selectedVendors.length} vendor(s)?`)) {
      // Implement bulk reject logic
      alert(`Rejected ${selectedVendors.length} vendor(s)`)
      setSelectedVendors([])
      setShowBulkActions(false)
      handleRefresh()
    }
  }

  const handleBulkExport = () => {
    // Implement bulk export logic
    const exportData = vendorsArray.filter(v => selectedVendors.includes(v._id))
    console.log('Exporting data:', exportData)
    alert(`Exported ${exportData.length} vendor(s)`)
  }

  

  // Calculate stats safely
  const stats = {
    total: vendorsArray.length,
    approved: vendorsArray.filter(v => v?.status === 'approved').length,
    pending: vendorsArray.filter(v => v?.status === 'pending').length,
    suspended: vendorsArray.filter(v => v?.status === 'suspended').length,
    rejected: vendorsArray.filter(v => v?.status === 'rejected').length
  }

  // Get vendor display info safely
  const getVendorInfo = (vendor) => {
    if (!vendor) return {
      businessName: 'N/A',
      email: 'N/A',
      phone: 'N/A',
      contactName: 'N/A',
      npi: 'N/A',
      dea: 'N/A',
      registeredDate: null,
      status: 'pending',
      documentsCount: 0,
      location: 'N/A'
    }

    return {
      businessName: vendor.pharmacyInfo?.legalBusinessName ||
        vendor.pharmacyInfo?.name ||
        vendor.businessName ||
        'N/A',
      email: vendor.pharmacyOwner?.email ||
        vendor.email ||
        vendor.contactEmail ||
        'N/A',
      phone: vendor.pharmacyOwner?.phone ||
        vendor.phone ||
        vendor.contactPhone ||
        'N/A',
      contactName: `${vendor.pharmacyOwner?.firstName || ''} ${vendor.pharmacyOwner?.lastName || ''}`.trim() ||
        vendor.contactName ||
        'N/A',
      npi: vendor.pharmacyInfo?.npiNumber ||
        vendor.npiNumber ||
        'N/A',
      dea: vendor.pharmacyLicense?.deaNumber ||
        'N/A',
      registeredDate: vendor.registeredAt ||
        vendor.createdAt ||
        vendor.signupDate,
      status: vendor.status || 'pending',
      documentsCount: vendor.documents?.length || 0,
      location: vendor.pharmacyInfo?.shippingAddress?.city ||
        vendor.pharmacyInfo?.shippingAddress?.state ||
        'N/A'
    }
  }

  const getSortIcon = (column) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-gray-400" />
    return sortOrder === 'asc'
      ? <ChevronDown className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 transform rotate-180 text-blue-600" />
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
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-sm text-red-700 mt-1">
                {error.includes('permission') && (
                  'You need "canManageVendors" permission to access this page.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkApprove}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Check className="w-3 h-3 mr-1" />
                Approve
              </button>
              <button
                onClick={handleBulkReject}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <X className="w-3 h-3 mr-1" />
                Reject
              </button>
              <button
                onClick={handleBulkExport}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </button>
              <button
                onClick={() => {
                  setSelectedVendors([])
                  setShowBulkActions(false)
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
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
                  <Clock className="h-6 w-6 text-yellow-600" />
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rejected
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.rejected}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
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
                  placeholder="Search vendors by name, email, phone, NPI, DEA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="registeredAt">Date Registered</option>
                  <option value="businessName">Business Name</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items per page
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={pagination.limit}
                  onChange={(e) => dispatch(setFilters({ limit: parseInt(e.target.value), page: 1 }))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="mt-4 text-gray-600">Loading vendors...</span>
              {lastUpdated && (
                <span className="text-sm text-gray-400 mt-2">
                  Last updated: {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                </span>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading vendors</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              {vendorsArray.length > 0 ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500">
                    Showing {vendorsArray.length} of {pagination.total} vendor{pagination.total !== 1 ? 's' : ''}
                    {lastUpdated && (
                      <span className="ml-2 text-gray-400">
                        • Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                            checked={selectedVendors.length === vendorsArray.length && vendorsArray.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('businessName')}
                            className="flex items-center hover:text-gray-700"
                          >
                            Vendor Info
                            <span className="ml-1">{getSortIcon('businessName')}</span>
                          </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('status')}
                            className="flex items-center hover:text-gray-700"
                          >
                            Status
                            <span className="ml-1">{getSortIcon('status')}</span>
                          </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('registeredAt')}
                            className="flex items-center hover:text-gray-700"
                          >
                            Registered
                            <span className="ml-1">{getSortIcon('registeredAt')}</span>
                          </button>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documents
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendorsArray.map((vendor) => {
                        const vendorInfo = getVendorInfo(vendor)
                        const isSelected = selectedVendors.includes(vendor._id)

                        return (
                          <tr
                            key={vendor._id}
                            className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                          >
                            <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                              <input
                                type="checkbox"
                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                                checked={isSelected}
                                onChange={() => handleVendorSelect(vendor._id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Building className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {vendorInfo.businessName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                      {vendorInfo.email}
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                      {vendorInfo.phone}
                                    </div>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-400">
                                    <div>NPI: {vendorInfo.npi}</div>
                                    <div>Location: {vendorInfo.location}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(vendorInfo.status)}
                              {vendorInfo.status === 'rejected' && vendor.rejectionReason && (
                                <div className="mt-1 text-xs text-red-600 truncate max-w-xs" title={vendor.rejectionReason}>
                                  {vendor.rejectionReason}
                                </div>
                              )}
                              {vendorInfo.status === 'suspended' && vendor.suspensionReason && (
                                <div className="mt-1 text-xs text-gray-600 truncate max-w-xs" title={vendor.suspensionReason}>
                                  {vendor.suspensionReason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {vendorInfo.registeredDate ? (
                                  <>
                                    <div>
                                      <div>{format(new Date(vendorInfo.registeredDate), 'MMM d, yyyy')}</div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        ({formatDistanceToNow(new Date(vendorInfo.registeredDate), { addSuffix: true })})
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  'N/A'
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className={`w-4 h-4 mr-2 ${vendorInfo.documentsCount > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                                <div>
                                  <div className="text-sm text-gray-900">
                                    {vendorInfo.documentsCount} document{vendorInfo.documentsCount !== 1 ? 's' : ''}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {vendorInfo.documentsCount === 0 ? 'No documents' :
                                      vendorInfo.documentsCount < 3 ? 'Incomplete' : 'Complete'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => viewVendorDetails(vendor._id)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No vendors registered yet'}
                  </p>
                  {(searchQuery || selectedStatus !== 'all') && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && vendorsArray.length > 0 && pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum
                      if (pagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

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

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
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