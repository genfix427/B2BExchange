import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchVendorDetails,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
  downloadAllDocuments
} from '../../store/slices/vendorSlice'
import {
  fetchVendorProducts
} from '../../store/slices/adminProductSlice'
import {
  clearOrderData
} from '../../store/slices/orderSlice'
import {
  AlertCircle,
  ArrowLeft,
  MoreVertical,
  Edit,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building,
  ShoppingCart,
  Star,
  PauseCircle,
  FileText,
  Shield,
  Package,
  Users as UsersIcon,
  BarChart,
  History as HistoryIcon,
  Briefcase,
  Banknote,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  CheckSquare
} from 'lucide-react'

// Import tab components
import InformationTab from '../../components/VendorDetails/InformationTab'
import DocumentsTab from '../../components/VendorDetails/DocumentsTab'
import LicensesTab from '../../components/VendorDetails/LicensesTab'
import ContactsTab from '../../components/VendorDetails/ContactsTab'
import ProductsTab from '../../components/VendorDetails/ProductsTab'
import OrdersTab from '../../components/VendorDetails/OrdersTab'
import AnalyticsTab from '../../components/VendorDetails/AnalyticsTab'
import HistoryTab from '../../components/VendorDetails/HistoryTab'
import BankDetailsTab from '../../components/VendorDetails/BankDetailsTab'
import Index from '../../components/VendorDetails/OrdersTab/Index'

// Import modal components
import RejectModal from '../../components/VendorDetails/modals/RejectModal'
import SuspendModal from '../../components/VendorDetails/modals/SuspendModal'
import ReactivateModal from '../../components/VendorDetails/modals/ReactivateModal'
import DocumentViewer from '../../components/VendorDetails/modals/DocumentViewer'
import LicenseDetailsModal from '../../components/VendorDetails/modals/LicenseDetailsModal'

// Import custom hooks
import { useVendorStatus } from '../../components/VendorDetails/hooks/useVendorStatus'
import { useModals } from '../../components/VendorDetails/hooks/useModals'
import { useDocuments } from '../../components/VendorDetails/hooks/useDocuments'
import { useLicenses } from '../../components/VendorDetails/hooks/useLicenses'
import { useUtilities } from '../../components/VendorDetails/hooks/useUtilities'
import { useIcons } from '../../components/VendorDetails/hooks/useIcons'

// Import date formatting
import { format } from 'date-fns'

const VendorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { selectedVendor, isLoading, error } = useSelector((state) => state.vendors)
  const { vendorProducts } = useSelector((state) => state.adminProducts)
  const { sellOrders, purchaseOrders, stats } = useSelector((state) => state.orders)

  const [activeTab, setActiveTab] = useState('info')

  // Custom hooks
  const { getStatusConfig } = useVendorStatus()
  const { formatAddress } = useUtilities()
  const { getStatusIcon, getDocumentIcon } = useIcons()

  const {
    showRejectModal,
    setShowRejectModal,
    rejectionReason,
    setRejectionReason,
    showSuspendModal,
    setShowSuspendModal,
    suspensionReason,
    setSuspensionReason,
    showReactivateModal,
    setShowReactivateModal,
    handleApprove,
    handleReject,
    handleSuspend,
    handleReactivate
  } = useModals(
    id,
    dispatch,
    fetchVendorDetails,
    approveVendor,
    rejectVendor,
    suspendVendor,
    reactivateVendor
  )

  const {
    documents,
    viewDocument,
    downloadDocument,
    viewingDocument,
    setViewingDocument,
    showDocumentViewer,
    setShowDocumentViewer,
    handleDownloadAllDocuments
  } = useDocuments(selectedVendor, dispatch, id, downloadAllDocuments)

  const {
    licenses,
    selectedLicense,
    setSelectedLicense
  } = useLicenses(selectedVendor)

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorDetails(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (selectedVendor?._id) {
      dispatch(fetchVendorProducts({ vendorId: selectedVendor._id }))
    }
  }, [dispatch, selectedVendor?._id])

  useEffect(() => {
    // Clean up order data when component unmounts
    return () => {
      dispatch(clearOrderData())
    }
  }, [dispatch])

  // Calculate stats for quick view
  const calculateQuickStats = () => {
    const sellRevenue = sellOrders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
    const purchaseSpent = purchaseOrders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
    
    return {
      sellOrders: sellOrders.total || 0,
      purchaseOrders: purchaseOrders.total || 0,
      sellRevenue,
      purchaseSpent,
      totalRevenue: sellRevenue + purchaseSpent,
      avgOrderValue: sellOrders.total > 0 ? sellRevenue / sellOrders.total : 0
    }
  }

  const quickStats = calculateQuickStats()

  const getProductsCount = () => vendorProducts?.length ?? 0

  const getOrderStats = () => {
    const deliveredSell = sellOrders.data?.filter(o => o.status === 'delivered').length || 0
    const deliveredPurchase = purchaseOrders.data?.filter(o => o.status === 'delivered').length || 0
    
    return {
      deliveredSell,
      deliveredPurchase,
      pendingSell: sellOrders.data?.filter(o => o.status === 'pending').length || 0,
      pendingPurchase: purchaseOrders.data?.filter(o => o.status === 'pending').length || 0
    }
  }

  const orderStats = getOrderStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading vendor details...</span>
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

  const statusConfig = getStatusConfig(selectedVendor.status)
  const StatusIcon = getStatusIcon(selectedVendor.status)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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
              {selectedVendor.pharmacyInfo?.legalBusinessName || 'Unnamed Vendor'}
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                <span className="ml-1 capitalize">
                  {selectedVendor.status}
                </span>
                <span className="ml-1">{selectedVendor.status?.charAt(0).toUpperCase() + selectedVendor.status?.slice(1)}</span>
              </span>
              <span className="text-sm text-gray-500">
                ID: {selectedVendor._id?.slice(-8) || 'N/A'}
              </span>
              {selectedVendor.email && (
                <span className="text-sm text-gray-500">
                  • {selectedVendor.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {selectedVendor.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
          {selectedVendor.status === 'approved' && (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Suspend
            </button>
          )}
          {selectedVendor.status === 'suspended' && (
            <button
              onClick={() => setShowReactivateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Reactivate
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats - Enhanced with Order Data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Licenses</p>
              <p className="text-xl font-bold text-gray-900">{licenses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Registered</p>
              <p className="text-sm font-bold text-gray-900">
                {selectedVendor.registeredAt ?
                  format(new Date(selectedVendor.registeredAt), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sell Orders</p>
              <p className="text-xl font-bold text-gray-900">{quickStats.sellOrders}</p>
              <p className="text-xs text-green-600">
                {orderStats.deliveredSell} delivered
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
              <p className="text-xl font-bold text-gray-900">{quickStats.purchaseOrders}</p>
              <p className="text-xs text-green-600">
                {orderStats.deliveredPurchase} delivered
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(quickStats.sellRevenue)}</p>
              <p className="text-xs text-gray-600">
                Avg: {formatCurrency(quickStats.avgOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sell Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(quickStats.sellRevenue)}
              </p>
              <p className="text-xs text-gray-500">
                {quickStats.sellOrders} orders • {sellOrders.data?.length || 0} active
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              quickStats.sellRevenue > 10000 ? 'bg-green-100' : 
              quickStats.sellRevenue > 5000 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                quickStats.sellRevenue > 10000 ? 'text-green-600' : 
                quickStats.sellRevenue > 5000 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchase Activity</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(quickStats.purchaseSpent)}
              </p>
              <p className="text-xs text-gray-500">
                {quickStats.purchaseOrders} orders • {orderStats.pendingPurchase} pending
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{getProductsCount()}</p>
              <p className="text-xs text-gray-500">
                Active in catalog
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'info', label: 'Information', icon: Briefcase },
            { id: 'documents', label: 'Documents', icon: FileText, badge: documents.length },
            { id: 'licenses', label: 'Licenses', icon: Shield, badge: licenses.length },
            { id: 'contacts', label: 'Contacts', icon: UsersIcon },
            { id: 'bank', label: 'Bank Account', icon: Banknote, hasBankAccount: !!selectedVendor.bankAccount },
            { id: 'products', label: 'Products', icon: Package, badge: getProductsCount() },
            { id: 'orders', label: 'Orders', icon: ShoppingCart, 
              badge: quickStats.sellOrders + quickStats.purchaseOrders > 0 ? 
                quickStats.sellOrders + quickStats.purchaseOrders : null },
            { id: 'analytics', label: 'Analytics', icon: BarChart },
            { id: 'history', label: 'History', icon: HistoryIcon }
          ].map(({ id, label, icon: Icon, badge, hasBankAccount }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
              {badge !== undefined && badge !== null && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  id === 'orders' && badge > 0 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {badge}
                </span>
              )}
              {id === 'bank' && hasBankAccount && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  ✓
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeTab === 'info' && (
          <InformationTab
            vendor={selectedVendor}
            getStatusConfig={getStatusConfig}
            getStatusIcon={getStatusIcon}
            licenses={licenses}
            setSelectedLicense={setSelectedLicense}
            formatAddress={formatAddress}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            documents={documents}
            getDocumentIcon={getDocumentIcon}
            viewDocument={viewDocument}
            downloadDocument={downloadDocument}
            handleDownloadAllDocuments={handleDownloadAllDocuments}
          />
        )}

        {activeTab === 'licenses' && (
          <LicensesTab
            licenses={licenses}
            setSelectedLicense={setSelectedLicense}
            getDocumentIcon={getDocumentIcon}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab vendor={selectedVendor} />
        )}

        {activeTab === 'bank' && (
          <BankDetailsTab vendor={selectedVendor} />
        )}

        {activeTab === 'products' && (
          <ProductsTab vendor={selectedVendor} />
        )}

        {activeTab === 'orders' && (
          <Index vendor={selectedVendor} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab vendor={selectedVendor} />
        )}

        {activeTab === 'history' && (
          <HistoryTab vendor={selectedVendor} />
        )}
      </div>

      {/* Order Status Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-xl font-bold text-gray-900">
                  {orderStats.pendingSell + orderStats.pendingPurchase}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {orderStats.pendingSell} sell • {orderStats.pendingPurchase} purchase
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-xl font-bold text-gray-900">
                  {sellOrders.data?.filter(o => o.status === 'processing').length || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              In progress
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-xl font-bold text-gray-900">
                  {sellOrders.data?.filter(o => o.status === 'shipped').length || 0}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              In transit
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-xl font-bold text-gray-900">
                  {orderStats.deliveredSell + orderStats.deliveredPurchase}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {orderStats.deliveredSell} sell • {orderStats.deliveredPurchase} purchase
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Banknote className="w-6 h-6 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Bank Account Status</p>
              <p className="text-sm font-bold text-gray-900">
                {selectedVendor.bankAccount ? 'Configured' : 'Not Setup'}
              </p>
              {selectedVendor.bankAccount?.achAuthorization && (
                <span className="text-xs text-emerald-600">ACH Authorization Active</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('bank')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={() => setActiveTab('history')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {sellOrders.data?.slice(0, 3).map((order) => (
            <div key={order._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sell Order: {order.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {order.customerName} • {formatCurrency(order.total)}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.status}
              </span>
            </div>
          ))}
          {purchaseOrders.data?.slice(0, 2).map((order) => (
            <div key={order._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Purchase: {order.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  From {order.items?.[0]?.vendorName || 'multiple vendors'} • {formatCurrency(order.total)}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <RejectModal
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleReject={handleReject}
      />

      <SuspendModal
        showSuspendModal={showSuspendModal}
        setShowSuspendModal={setShowSuspendModal}
        suspensionReason={suspensionReason}
        setSuspensionReason={setSuspensionReason}
        handleSuspend={handleSuspend}
      />

      <ReactivateModal
        showReactivateModal={showReactivateModal}
        setShowReactivateModal={setShowReactivateModal}
        handleReactivate={handleReactivate}
      />

      <DocumentViewer
        viewingDocument={viewingDocument}
        showDocumentViewer={showDocumentViewer}
        setShowDocumentViewer={setShowDocumentViewer}
        getDocumentIcon={getDocumentIcon}
        downloadDocument={downloadDocument}
        setViewingDocument={setViewingDocument}
      />

      <LicenseDetailsModal
        selectedLicense={selectedLicense}
        setSelectedLicense={setSelectedLicense}
        getDocumentIcon={getDocumentIcon}
        viewDocument={viewDocument}
        downloadDocument={downloadDocument}
      />
    </div>
  )
}

export default VendorDetailPage