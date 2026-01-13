import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Building,
  User,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import {
  fetchAllOrders,
  updateOrderStatus,
  generateInvoice,
  exportOrders,
  setOrdersPage
} from '../../store/slices/orderSlice';
import OrderDetailsModal from '../../components/OrderDetails/OrderDetailsModal';

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { allOrders } = useSelector((state) => state.orders);

const orders = allOrders;
const loading = allOrders.loading;
const error = allOrders.error;

  
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    vendorId: ''
  });
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    show: false,
    orderId: null,
    newStatus: '',
    trackingNumber: '',
    carrier: ''
  });
  const [viewOrderDetails, setViewOrderDetails] = useState(null);

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'partially_shipped', label: 'Partially Shipped' },
    { value: 'partially_delivered', label: 'Partially Delivered' }
  ];

  // Order type options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'sell', label: 'Sell Orders' },
    { value: 'purchase', label: 'Purchase Orders' }
  ];

  // Carrier options for status update
  const carrierOptions = [
    { value: '', label: 'Select Carrier' },
    { value: 'UPS', label: 'UPS' },
    { value: 'FedEx', label: 'FedEx' },
    { value: 'USPS', label: 'USPS' },
    { value: 'DHL', label: 'DHL' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    dispatch(fetchAllOrders({
      page: orders.page,
      limit: 20,
      ...filters
    }));
  }, [dispatch, orders.page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    dispatch(setOrdersPage(1));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= orders.pages) {
      dispatch(setOrdersPage(newPage));
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdateModal.orderId) return;
    
    await dispatch(updateOrderStatus({
      orderId: statusUpdateModal.orderId,
      data: {
        status: statusUpdateModal.newStatus,
        trackingNumber: statusUpdateModal.trackingNumber,
        carrier: statusUpdateModal.carrier
      }
    }));
    
    setStatusUpdateModal({ show: false, orderId: null, newStatus: '', trackingNumber: '', carrier: '' });
    dispatch(fetchAllOrders({
      page: orders.page,
      limit: 20,
      ...filters
    }));
  };

  const handleExportOrders = () => {
    dispatch(exportOrders({ type: filters.type || 'all', filters }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      packed: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      partially_shipped: 'bg-orange-100 text-orange-800',
      partially_delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      packed: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  const getOrderType = (order) => {
    // In a real app, you'd check if vendor is seller or buyer
    // For now, we'll use a simple heuristic
    return order.orderType || 'mixed';
  };

  const getOrderTypeIcon = (type) => {
    return type === 'sell' ? ShoppingBag : ShoppingCart;
  };

  const getOrderTypeColor = (type) => {
    return type === 'sell' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const handleViewOrderDetails = (order) => {
    setViewOrderDetails(order);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage all vendor orders in one place</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => dispatch(fetchAllOrders({ page: 1, limit: 20, ...filters }))}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExportOrders}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Orders
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.data?.filter(o => o.status === 'pending').length || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.data?.filter(o => o.status === 'shipped' || o.status === 'partially_shipped').length || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.data?.filter(o => o.status === 'delivered' || o.status === 'partially_delivered').length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="From Date"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="To Date"
            />
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleFilterChange('vendorId', filters.vendorId ? '' : 'show')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-4 h-4 mr-1" />
            Advanced Filters
          </button>
          
          {filters.vendorId === 'show' && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor ID
                </label>
                <input
                  type="text"
                  value={filters.vendorId === 'show' ? '' : filters.vendorId}
                  onChange={(e) => handleFilterChange('vendorId', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter vendor ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="$10000"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => dispatch(fetchAllOrders({ page: 1, limit: 20, ...filters }))}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : orders.data.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status || filters.search || filters.dateFrom ? 
                'Try changing your filters' : 
                'Orders will appear here when placed'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer/Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.data.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    const orderType = getOrderType(order);
                    const OrderTypeIcon = getOrderTypeIcon(orderType);
                    
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        {/* Order Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateTime(order.createdAt)}
                            </div>
                          </div>
                        </td>

                        {/* Customer/Vendor */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {orderType === 'sell' ? (
                              <Building className="h-4 w-4 text-blue-500 mr-2" />
                            ) : (
                              <User className="h-4 w-4 text-green-500 mr-2" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.customerEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Items */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(orderType)}`}>
                              <OrderTypeIcon className="w-3 h-3 mr-1" />
                              {orderType === 'sell' ? 'Sell' : 'Purchase'}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              {order.items?.length || 0} items
                            </span>
                          </div>
                          {order.trackingNumber && (
                            <div className="text-xs text-gray-500 mt-1">
                              Tracking: {order.trackingNumber}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(order.total)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Payment: {order.paymentStatus}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {order.status?.replace('_', ' ')}
                            </span>
                          </div>
                          {order.shippedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(order.shippedAt)}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewOrderDetails(order)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => dispatch(generateInvoice(order._id))}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Download Invoice"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setStatusUpdateModal({
                                show: true,
                                orderId: order._id,
                                newStatus: order.status,
                                trackingNumber: order.trackingNumber || '',
                                carrier: order.carrier || ''
                              })}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Update Status"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders.data.length > 0 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(orders.page - 1)}
                    disabled={orders.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(orders.page + 1)}
                    disabled={orders.page === orders.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(orders.page - 1) * 20 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(orders.page * 20, orders.total)}
                      </span>{' '}
                      of <span className="font-medium">{orders.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(orders.page - 1)}
                        disabled={orders.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {[...Array(Math.min(5, orders.pages))].map((_, i) => {
                        const pageNumber = Math.max(1, Math.min(orders.pages - 4, orders.page - 2)) + i;
                        if (pageNumber > 0 && pageNumber <= orders.pages) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                orders.page === pageNumber
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => handlePageChange(orders.page + 1)}
                        disabled={orders.page === orders.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal.show && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusUpdateModal.newStatus}
                    onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, newStatus: e.target.value }))}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {statusOptions.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(statusUpdateModal.newStatus === 'shipped' || statusUpdateModal.newStatus === 'delivered') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={statusUpdateModal.trackingNumber}
                        onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, trackingNumber: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter tracking number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Carrier
                      </label>
                      <select
                        value={statusUpdateModal.carrier}
                        onChange={(e) => setStatusUpdateModal(prev => ({ ...prev, carrier: e.target.value }))}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {carrierOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setStatusUpdateModal({ show: false, orderId: null, newStatus: '', trackingNumber: '', carrier: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {viewOrderDetails && (
        <OrderDetailsModal
          order={viewOrderDetails}
          isOpen={!!viewOrderDetails}
          onClose={() => setViewOrderDetails(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;