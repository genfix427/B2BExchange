// src/pages/store/OrderDetailsPage.jsx
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
  ExternalLink
} from 'lucide-react';
import { fetchOrderDetails } from '../../store/slices/storeSlice';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.store);
  const order = orders.currentOrder;
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (date) => {
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

  if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

if (!order) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-gray-900">
        Order not found
      </h2>
      <Link
        to="/store/orders"
        className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Orders
      </Link>
    </div>
  );
}


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/store/orders"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Orders
            </Link>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
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
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['details', 'items', 'tracking', 'payment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
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

        <div className="p-6">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.orderNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.shippingAddress?.line1}
                    </p>
                    {order.shippingAddress?.line2 && (
                      <p className="text-sm text-gray-900">{order.shippingAddress.line2}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {item.product?.image?.url ? (
                                <img
                                  className="h-10 w-10 rounded-md object-contain"
                                  src={item.product.image.url}
                                  alt={item.productName}
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                NDC: {item.ndcNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.vendorName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6">
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
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="relative">
                {/* Tracking Timeline */}
                <div className="space-y-8">
                  {order.vendorOrders?.map((vendorOrder, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Vendor: {vendorOrder.vendorName}
                      </h4>
                      
                      <div className="relative">
                        {/* Timeline */}
                        <div className="flex items-start">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              vendorOrder.status === 'delivered' 
                                ? 'bg-green-500' 
                                : vendorOrder.status === 'shipped'
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            }`}>
                              {vendorOrder.status === 'delivered' ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : vendorOrder.status === 'shipped' ? (
                                <Truck className="w-5 h-5 text-white" />
                              ) : (
                                <Package className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="h-12 w-0.5 bg-gray-300 mt-2"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {vendorOrder.status === 'delivered' ? 'Delivered' :
                                   vendorOrder.status === 'shipped' ? 'Shipped' :
                                   vendorOrder.status === 'processing' ? 'Processing' : 'Order Confirmed'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {vendorOrder.status === 'shipped' && vendorOrder.shippedAt 
                                    ? `Shipped on ${formatDate(vendorOrder.shippedAt)}`
                                    : `Last updated: ${formatDate(order.updatedAt)}`}
                                </p>
                                {vendorOrder.trackingNumber && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                      Tracking #: {vendorOrder.trackingNumber}
                                    </p>
                                    <button className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                                      <ExternalLink className="w-4 h-4 inline mr-1" />
                                      Track Package
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  vendorOrder.status === 'delivered' 
                                    ? 'bg-green-100 text-green-800'
                                    : vendorOrder.status === 'shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {vendorOrder.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-6 h-6 text-gray-400 mr-3" />
                  <h4 className="font-medium text-gray-900">Payment Information</h4>
                </div>
                
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {order.paymentMethod?.replace('_', ' ').toUpperCase()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus?.toUpperCase()}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                    <dd className="mt-1 text-2xl font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Payment Instructions</h4>
                <div className="prose prose-sm text-gray-600">
                  <p>
                    For bank transfers, please use the following details:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li>Bank: PharmaExchange Bank</li>
                    <li>Account #: 1234567890</li>
                    <li>Routing #: 021000021</li>
                    <li>Reference: Order #{order.orderNumber}</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    Payments typically process within 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;