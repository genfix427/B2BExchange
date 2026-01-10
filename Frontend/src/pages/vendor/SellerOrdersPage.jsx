// src/pages/vendor/SellerOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Eye,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Edit,
  Search,
  Calendar,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { fetchVendorOrders, updateOrderStatus, selectVendorOrders } from '../../store/slices/storeSlice';

const SellerOrdersPage = () => {
  const dispatch = useDispatch();
  const { loading, vendorOrdersPagination } = useSelector((state) => state.store);
  const vendorOrders = useSelector(selectVendorOrders);
  
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({
    status: '',
    trackingNumber: '',
    carrier: 'UPS'
  });

  useEffect(() => {
    dispatch(fetchVendorOrders(filters));
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchVendorOrders(filters));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch, filters]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        label: 'Pending'
      },
      confirmed: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle,
        label: 'Confirmed'
      },
      processing: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Package,
        label: 'Processing'
      },
      packed: { 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        icon: Package,
        label: 'Packed'
      },
      shipped: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: Truck,
        label: 'Shipped'
      },
      delivered: { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: CheckCircle,
        label: 'Delivered'
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        label: 'Cancelled'
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color} border`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const handleUpdateStatus = async (orderId) => {
    if (!trackingData.status) return;
    
    try {
      await dispatch(updateOrderStatus({
        orderId,
        status: trackingData.status,
        trackingNumber: trackingData.trackingNumber,
        carrier: trackingData.carrier
      })).unwrap();
      
      setUpdatingOrder(null);
      setTrackingData({ status: '', trackingNumber: '', carrier: 'UPS' });
      
      // Refresh orders list
      dispatch(fetchVendorOrders(filters));
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleStatusClick = (order) => {
    setUpdatingOrder(order._id);
    setTrackingData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || 'UPS'
    });
  };

  const refreshOrders = () => {
    dispatch(fetchVendorOrders(filters));
  };

  // Safe calculations with null checks
  const totalRevenue = Array.isArray(vendorOrders) 
    ? vendorOrders.reduce((sum, order) => sum + (order?.total || 0), 0)
    : 0;
    
  const pendingOrders = Array.isArray(vendorOrders)
    ? vendorOrders.filter(o => o?.status === 'pending').length
    : 0;
    
  const shippedOrders = Array.isArray(vendorOrders)
    ? vendorOrders.filter(o => o?.status === 'shipped').length
    : 0;

  if (loading && vendorOrders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Orders Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage orders from other vendors in real-time</p>
          </div>
          <button
            onClick={refreshOrders}
            disabled={loading}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Active sales</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pendingOrders}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Need attention
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {shippedOrders}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            In transit
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order # or customer..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            {vendorOrders?.length || 0} orders • Auto-refreshing every 30 seconds
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {!vendorOrders || vendorOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              When other vendors purchase your products, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendorOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-blue-600">
                          Order #{order.orderNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.createdAt ? formatDate(order.createdAt) : 'Date not available'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.customerName || 'Unknown Customer'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customerEmail || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {updatingOrder === order._id ? (
                        <div className="space-y-2">
                          <select
                            value={trackingData.status}
                            onChange={(e) => setTrackingData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          {trackingData.status === 'shipped' && (
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Tracking #"
                                value={trackingData.trackingNumber}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                              />
                              <select
                                value={trackingData.carrier}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, carrier: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                              >
                                <option value="UPS">UPS</option>
                                <option value="FedEx">FedEx</option>
                                <option value="USPS">USPS</option>
                                <option value="DHL">DHL</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateStatus(order._id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => {
                                setUpdatingOrder(null);
                                setTrackingData({ status: '', trackingNumber: '', carrier: 'UPS' });
                              }}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status || 'pending')}
                          <button
                            onClick={() => handleStatusClick(order)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(order.total || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/vendor/orders/${order._id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        {order.trackingNumber && (
                          <a
                            href="#"
                            className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.preventDefault();
                              if (order.trackingNumber) {
                                const trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
                                window.open(trackingUrl, '_blank');
                              }
                            }}
                          >
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            Track
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Status Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Status Updates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={async () => {
              const pendingOrders = vendorOrders?.filter(o => o?.status === 'pending') || [];
              for (const order of pendingOrders) {
                try {
                  await dispatch(updateOrderStatus({
                    orderId: order._id,
                    status: 'confirmed'
                  })).unwrap();
                } catch (error) {
                  console.error(`Failed to update order ${order.orderNumber}:`, error);
                }
              }
              refreshOrders();
            }}
            className="flex items-center justify-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 text-blue-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Confirm All Pending</span>
          </button>
          
          <button
            onClick={() => {
              const confirmedOrders = vendorOrders?.filter(o => o?.status === 'confirmed') || [];
              alert(`Mark ${confirmedOrders.length} orders as shipped`);
            }}
            className="flex items-center justify-center px-4 py-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 text-green-700"
          >
            <Truck className="w-5 h-5 mr-2" />
            <span>Bulk Ship Orders</span>
          </button>
          
          <button
            onClick={refreshOrders}
            className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 text-gray-700"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            <span>Force Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerOrdersPage;