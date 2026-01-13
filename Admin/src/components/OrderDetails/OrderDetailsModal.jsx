import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  Download,
  Package,
  Truck,
  User,
  Building,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Edit,
  Save,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { updateOrderStatus, generateInvoice } from '../../store/slices/orderSlice';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(order?.status || '');
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: order?.trackingNumber || '',
    carrier: order?.carrier || ''
  });

  if (!isOpen || !order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
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
      cancelled: AlertCircle
    };
    return icons[status] || Clock;
  };

  const StatusIcon = getStatusIcon(order.status);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const carrierOptions = [
    { value: '', label: 'Select Carrier' },
    { value: 'UPS', label: 'UPS' },
    { value: 'FedEx', label: 'FedEx' },
    { value: 'USPS', label: 'USPS' },
    { value: 'DHL', label: 'DHL' },
    { value: 'Other', label: 'Other' }
  ];

  const handleUpdateStatus = () => {
    dispatch(updateOrderStatus({
      orderId: order._id,
      data: {
        status: newStatus,
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier,
        note: 'Status updated by admin'
      }
    })).then(() => {
      setIsEditingStatus(false);
    });
  };

  const handleDownloadInvoice = () => {
    dispatch(generateInvoice(order._id));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Invoice
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Order Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      {isEditingStatus ? (
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {order.status?.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Order Items ({order.items?.length || 0})
                  </h3>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            {item.image?.url ? (
                              <img
                                src={item.image.url}
                                alt={item.productName}
                                className="h-16 w-16 object-cover rounded-lg mr-4"
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                NDC: {item.ndcNumber} • {item.strength} • {item.dosageForm}
                              </p>
                              <p className="text-xs text-gray-500">
                                Manufacturer: {item.manufacturer}
                              </p>
                              <div className="mt-2 flex items-center text-xs text-gray-600">
                                <Building className="w-3 h-3 mr-1" />
                                Seller: {item.vendorName}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vendor Orders */}
                {order.vendorOrders && order.vendorOrders.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      Vendor Orders ({order.vendorOrders.length})
                    </h3>
                    <div className="space-y-4">
                      {order.vendorOrders.map((vendorOrder, index) => {
                        const VendorStatusIcon = getStatusIcon(vendorOrder.status);
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {vendorOrder.vendorName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Status: {vendorOrder.status}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendorOrder.status)}`}>
                                <VendorStatusIcon className="w-3 h-3 mr-1" />
                                {vendorOrder.status}
                              </span>
                            </div>
                            {vendorOrder.trackingNumber && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Tracking Number</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {vendorOrder.trackingNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Carrier</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {vendorOrder.carrier || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                {vendorOrder.shippedAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Shipped: {formatDate(vendorOrder.shippedAt)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {order.customerEmail}
                      </p>
                    </div>
                    {order.customerPhone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {order.customerPhone}
                        </p>
                      </div>
                    )}
                    {order.customer?.pharmacyInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Business</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer.pharmacyInfo.legalBusinessName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Shipping Address
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && (
                        <p className="text-sm text-gray-900">{order.shippingAddress.line2}</p>
                      )}
                      <p className="text-sm text-gray-900">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tracking Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-blue-600" />
                      Tracking Information
                    </h3>
                    {!isEditingStatus && (
                      <button
                        onClick={() => setIsEditingStatus(true)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditingStatus ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={trackingInfo.trackingNumber}
                          onChange={(e) => setTrackingInfo(prev => ({ ...prev, trackingNumber: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter tracking number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carrier
                        </label>
                        <select
                          value={trackingInfo.carrier}
                          onChange={(e) => setTrackingInfo(prev => ({ ...prev, carrier: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {carrierOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleUpdateStatus}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Update Status
                        </button>
                        <button
                          onClick={() => setIsEditingStatus(false)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {order.trackingNumber ? (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Tracking Number</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.trackingNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Carrier</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.carrier || 'Not specified'}
                            </p>
                          </div>
                          {order.shippedAt && (
                            <div>
                              <p className="text-sm text-gray-600">Shipped Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(order.shippedAt)}
                              </p>
                            </div>
                          )}
                          {order.deliveredAt && (
                            <div>
                              <p className="text-sm text-gray-600">Delivered Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(order.deliveredAt)}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No tracking information available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Totals */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Order Totals
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>
                    {order.shippingCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.shippingCost)}
                        </span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tax</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.tax)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Order History
                    </h3>
                    <div className="space-y-4">
                      {order.statusHistory.slice(0, 5).map((history, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              history.status === 'delivered' ? 'bg-green-100' :
                              history.status === 'shipped' ? 'bg-orange-100' :
                              history.status === 'cancelled' ? 'bg-red-100' :
                              'bg-blue-100'
                            }`}>
                              {history.status === 'delivered' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : history.status === 'shipped' ? (
                                <Truck className="w-4 h-4 text-orange-600" />
                              ) : history.status === 'cancelled' ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            {index < order.statusHistory.slice(0, 5).length - 1 && (
                              <div className="w-0.5 h-4 bg-gray-200 mx-auto mt-1"></div>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {history.status.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(history.timestamp)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              By: {history.changedByType} • {history.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;