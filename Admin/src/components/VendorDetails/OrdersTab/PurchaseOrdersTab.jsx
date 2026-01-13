import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVendorPurchaseOrders,
  generateInvoice,
  setPurchaseOrdersPage
} from '../../../store/slices/orderSlice';
import {
  Search,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  ShoppingCart,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

const PurchaseOrdersTab = ({ vendor }) => {
  const dispatch = useDispatch();
  const { purchaseOrders } = useSelector((state) => state.orders);
  
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (vendor?._id) {
      dispatch(fetchVendorPurchaseOrders({
        vendorId: vendor._id,
        params: {
          page: purchaseOrders.page,
          limit: 10,
          ...filters
        }
      }));
    }
  }, [dispatch, vendor?._id, purchaseOrders.page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    dispatch(setPurchaseOrdersPage(1));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= purchaseOrders.pages) {
      dispatch(setPurchaseOrdersPage(newPage));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getVendorCount = (order) => {
    if (!order.items) return 0;
    const vendors = new Set(order.items.map(item => item.vendorName));
    return vendors.size;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
            <p className="text-sm text-gray-500">Orders where {vendor.pharmacyInfo?.legalBusinessName} is the buyer</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => dispatch(exportOrders({ type: 'purchase', filters }))}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="From Date"
        />
        
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="To Date"
        />
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{purchaseOrders.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {purchaseOrders.data.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Vendors Used</p>
              <p className="text-xl font-bold text-gray-900">
                {[...new Set(purchaseOrders.data.flatMap(o => o.items?.map(i => i.vendorName) || []))].length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(purchaseOrders.data.reduce((sum, order) => sum + (order.total || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {purchaseOrders.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading orders...</span>
          </div>
        ) : purchaseOrders.error ? (
          <div className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <p className="mt-2 text-sm text-red-600">{purchaseOrders.error}</p>
          </div>
        ) : purchaseOrders.data.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendors
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items & Total
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
                {purchaseOrders.data.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(new Date(order.createdAt), 'h:mm a')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getVendorCount(order)} vendors
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items?.slice(0, 2).map(item => item.vendorName).join(', ')}
                        {order.items?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.total || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => dispatch(generateInvoice(order._id))}
                          className="text-green-600 hover:text-green-900"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {purchaseOrders.data.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(purchaseOrders.page - 1)}
                disabled={purchaseOrders.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(purchaseOrders.page + 1)}
                disabled={purchaseOrders.page === purchaseOrders.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(purchaseOrders.page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(purchaseOrders.page * 10, purchaseOrders.total)}
                  </span>{' '}
                  of <span className="font-medium">{purchaseOrders.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(purchaseOrders.page - 1)}
                    disabled={purchaseOrders.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(Math.min(5, purchaseOrders.pages))].map((_, i) => {
                    const pageNumber = Math.max(1, Math.min(purchaseOrders.pages - 4, purchaseOrders.page - 2)) + i;
                    if (pageNumber > 0 && pageNumber <= purchaseOrders.pages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            purchaseOrders.page === pageNumber
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
                    onClick={() => handlePageChange(purchaseOrders.page + 1)}
                    disabled={purchaseOrders.page === purchaseOrders.pages}
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
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Purchase Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              {/* Order Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedOrder.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && (
                      <p className="text-sm text-gray-900">{selectedOrder.shippingAddress.line2}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
              )}

              {/* Items by Vendor */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items by Vendor</h4>
                <div className="space-y-4">
                  {selectedOrder.vendorOrders?.map((vendorOrder, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{vendorOrder.vendorName}</span>
                          <StatusBadge status={vendorOrder.status} small />
                        </div>
                      </div>
                      <div className="p-4">
                        {vendorOrder.items?.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t">
                          <span className="text-sm font-medium text-gray-900">Vendor Subtotal</span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(vendorOrder.subtotal || vendorOrder.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(selectedOrder.subtotal || selectedOrder.total)}
                  </span>
                </div>
                {selectedOrder.shippingCost > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Shipping</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(selectedOrder.shippingCost)}
                    </span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(selectedOrder.tax)}
                    </span>
                  </div>
                )}
                <div className="text-sm font-bold text-gray-900 flex justify-between items-center mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => dispatch(generateInvoice(selectedOrder._id))}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Download Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersTab;