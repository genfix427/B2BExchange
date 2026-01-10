// src/pages/vendor/VendorOrderDetailsPage.jsx - NEW FILE
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  MessageSquare,
  ExternalLink,
  User,
  Phone,
  Mail,
  DollarSign,
  ShoppingBag,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { fetchVendorOrderDetails, updateOrderStatus } from '../../store/slices/storeSlice';

const VendorOrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentVendorOrder, loading } = useSelector((state) => state.store);
  const [activeTab, setActiveTab] = useState('details');
  const [trackingData, setTrackingData] = useState({
    status: '',
    trackingNumber: '',
    carrier: 'UPS'
  });
  const [showTrackingForm, setShowTrackingForm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorOrderDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentVendorOrder) {
      setTrackingData({
        status: currentVendorOrder.vendorStatus || currentVendorOrder.status || 'pending',
        trackingNumber: currentVendorOrder.trackingNumber || '',
        carrier: currentVendorOrder.carrier || 'UPS'
      });
    }
  }, [currentVendorOrder]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      packed: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const handleUpdateStatus = async () => {
    if (!trackingData.status || !id) return;
    
    try {
      await dispatch(updateOrderStatus({
        orderId: id,
        status: trackingData.status,
        trackingNumber: trackingData.trackingNumber,
        carrier: trackingData.carrier
      })).unwrap();
      
      // Refresh order details
      dispatch(fetchVendorOrderDetails(id));
      setShowTrackingForm(false);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentVendorOrder) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The order you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          to="/vendor/orders"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const order = currentVendorOrder;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/vendor/orders"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sales Orders
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber || order._id?.substring(0, 8)}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.vendorStatus || order.status)}`}>
                {(order.vendorStatus || order.status || 'pending').toUpperCase()}
              </span>
              {order.trackingNumber && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                  <Truck className="w-4 h-4 inline mr-1" />
                  Tracking: {order.trackingNumber}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Customer
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
            <p className="text-sm text-gray-600 mt-1">
              Update the status and tracking information for this order
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!showTrackingForm ? (
              <button
                onClick={() => setShowTrackingForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Update Status
              </button>
            ) : (
              <button
                onClick={() => setShowTrackingForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {showTrackingForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={trackingData.status}
                  onChange={(e) => setTrackingData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              
              {trackingData.status === 'shipped' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tracking number"
                      value={trackingData.trackingNumber}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carrier
                    </label>
                    <select
                      value={trackingData.carrier}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, carrier: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UPS">UPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="USPS">USPS</option>
                      <option value="DHL">DHL</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{order.customerEmail || 'N/A'}</span>
                  </div>
                  {order.customer?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{order.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Shipping Address</p>
                    <p className="text-sm text-gray-600">Where to ship</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  {order.shippingAddress ? (
                    <>
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                      {order.shippingAddress.phone && <p className="mt-2">Phone: {order.shippingAddress.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-16 w-16">
                        {item.product?.image?.url ? (
                          <img
                            src={item.product.image.url}
                            alt={item.productName}
                            className="h-16 w-16 object-contain rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                            <p className="text-xs text-gray-500">NDC: {item.ndcNumber}</p>
                            {item.product?.strength && (
                              <p className="text-xs text-gray-500">{item.product.strength} • {item.product.dosageForm}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(item.unitPrice)} × {item.quantity}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No items found in this order</p>
                </div>
              )}
            </div>
            
            {/* Order Summary */}
            {order.items && order.items.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary & Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Order Number</dt>
                <dd className="text-sm font-medium text-gray-900">{order.orderNumber || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Order Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Payment Method</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {(order.paymentMethod || '').replace('_', ' ').toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Payment Status</dt>
                <dd className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(order.paymentStatus || 'pending').toUpperCase()}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Items</dt>
                <dd className="text-sm text-gray-900">{order.items?.length || 0}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping Information */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="text-sm font-medium text-gray-900">{order.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carrier</p>
                  <p className="text-sm font-medium text-gray-900">{order.carrier || 'N/A'}</p>
                </div>
                {order.shippedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Shipped Date</p>
                    <p className="text-sm text-gray-900">{formatDate(order.shippedAt)}</p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-600">Delivered Date</p>
                    <p className="text-sm text-gray-900">{formatDate(order.deliveredAt)}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (order.trackingNumber) {
                      let trackingUrl;
                      switch (order.carrier) {
                        case 'UPS':
                          trackingUrl = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
                          break;
                        case 'FedEx':
                          trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
                          break;
                        case 'USPS':
                          trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
                          break;
                        case 'DHL':
                          trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`;
                          break;
                        default:
                          trackingUrl = `https://www.google.com/search?q=track+${order.trackingNumber}`;
                      }
                      window.open(trackingUrl, '_blank');
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Track Package
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Shipping Label
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Customer
              </button>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailsPage;