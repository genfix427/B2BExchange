import React, { useState, useEffect } from 'react';
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
  Eye,
  ExternalLink,
  RefreshCw,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { updateOrderStatus, generateInvoice } from '../../store/slices/orderSlice';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingVendorStatus, setIsEditingVendorStatus] = useState({});
  const [newStatus, setNewStatus] = useState(order?.status || '');
  const [vendorTrackingInfo, setVendorTrackingInfo] = useState({});

  // Initialize vendor tracking info from order data
  useEffect(() => {
    if (order?.vendorOrders) {
      const initialVendorInfo = {};
      order.vendorOrders.forEach(vendorOrder => {
        initialVendorInfo[vendorOrder.vendor?._id || vendorOrder.vendor] = {
          status: vendorOrder.status || 'pending',
          trackingNumber: vendorOrder.trackingNumber || '',
          carrier: vendorOrder.carrier || '',
          note: ''
        };
      });
      setVendorTrackingInfo(initialVendorInfo);
    }
  }, [order]);

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
        note: 'Status updated by admin'
      }
    })).then(() => {
      setIsEditingStatus(false);
    });
  };

  const handleUpdateVendorStatus = (vendorId) => {
    const vendorInfo = vendorTrackingInfo[vendorId];
    if (!vendorInfo) return;

    dispatch(updateOrderStatus({
      orderId: order._id,
      vendorId: vendorId,
      data: {
        status: vendorInfo.status,
        trackingNumber: vendorInfo.trackingNumber,
        carrier: vendorInfo.carrier,
        note: vendorInfo.note || 'Status updated by admin'
      }
    })).then(() => {
      setIsEditingVendorStatus(prev => ({ ...prev, [vendorId]: false }));
    });
  };

  const handleDownloadInvoice = () => {
    dispatch(generateInvoice(order._id));
  };

  const handleVendorTrackingChange = (vendorId, field, value) => {
    setVendorTrackingInfo(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        [field]: value
      }
    }));
  };

  const getVendorItems = (vendorId) => {
    return order.items?.filter(item => 
      item.vendor?._id === vendorId || item.vendor?.toString() === vendorId?.toString()
    ) || [];
  };

  const getVendorTotal = (vendorId) => {
    const vendorItems = getVendorItems(vendorId);
    return vendorItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const getVendorOrder = (vendorId) => {
    return order.vendorOrders?.find(vo => 
      vo.vendor?._id === vendorId || vo.vendor?.toString() === vendorId?.toString()
    );
  };

  const getTrackingLink = (trackingNumber, carrier) => {
    if (!trackingNumber) return '#';
    
    const normalizedCarrier = (carrier || '').toLowerCase();
    
    if (normalizedCarrier.includes('ups')) {
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    } else if (normalizedCarrier.includes('fedex') || normalizedCarrier.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
    } else if (normalizedCarrier.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    } else if (normalizedCarrier.includes('dhl')) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    }
    
    return `#`;
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
                  {isEditingStatus && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={handleUpdateStatus}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update Status
                      </button>
                      <button
                        onClick={() => setIsEditingStatus(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Vendor Orders with Tracking Details */}
                {order.vendorOrders && order.vendorOrders.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-blue-600" />
                        Vendor Orders & Tracking ({order.vendorOrders.length})
                      </h3>
                      {!isEditingStatus && (
                        <button
                          onClick={() => setIsEditingStatus(true)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Main Status
                        </button>
                      )}
                    </div>
                    <div className="space-y-6">
                      {order.vendorOrders.map((vendorOrder, index) => {
                        const vendorId = vendorOrder.vendor?._id || vendorOrder.vendor;
                        const vendorInfo = vendorTrackingInfo[vendorId];
                        const vendorItems = getVendorItems(vendorId);
                        const vendorTotal = getVendorTotal(vendorId);
                        const VendorStatusIcon = getStatusIcon(vendorOrder.status);
                        const isEditing = isEditingVendorStatus[vendorId];
                        
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Vendor Header */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {vendorOrder.vendorName}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Vendor ID: {vendorId?.slice(-6) || 'N/A'}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendorOrder.status)}`}>
                                    <VendorStatusIcon className="w-3 h-3 mr-1" />
                                    {vendorOrder.status}
                                  </span>
                                  {!isEditing && (
                                    <button
                                      onClick={() => setIsEditingVendorStatus(prev => ({ ...prev, [vendorId]: true }))}
                                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="p-4">
                              {/* Vendor Items Summary */}
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Items from this vendor:</p>
                                <div className="space-y-2">
                                  {vendorItems.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">
                                        {item.quantity} × {item.productName}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatCurrency(item.totalPrice)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-center font-medium">
                                      <span>Vendor Total:</span>
                                      <span className="text-blue-600">{formatCurrency(vendorTotal)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Tracking Information */}
                              {isEditing ? (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-900 mb-3">Update Tracking Information</h5>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Status
                                      </label>
                                      <select
                                        value={vendorInfo?.status || 'pending'}
                                        onChange={(e) => handleVendorTrackingChange(vendorId, 'status', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                      >
                                        {statusOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Tracking Number
                                      </label>
                                      <input
                                        type="text"
                                        value={vendorInfo?.trackingNumber || ''}
                                        onChange={(e) => handleVendorTrackingChange(vendorId, 'trackingNumber', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter tracking number"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Carrier
                                      </label>
                                      <select
                                        value={vendorInfo?.carrier || ''}
                                        onChange={(e) => handleVendorTrackingChange(vendorId, 'carrier', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                      >
                                        {carrierOptions.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={vendorInfo?.note || ''}
                                        onChange={(e) => handleVendorTrackingChange(vendorId, 'note', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Add any notes"
                                      />
                                    </div>
                                    <div className="flex space-x-2 pt-2">
                                      <button
                                        onClick={() => handleUpdateVendorStatus(vendorId)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                      >
                                        <Save className="w-4 h-4 mr-2" />
                                        Update
                                      </button>
                                      <button
                                        onClick={() => setIsEditingVendorStatus(prev => ({ ...prev, [vendorId]: false }))}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h5 className="text-sm font-medium text-gray-900 mb-3">Tracking Information</h5>
                                  {vendorOrder.trackingNumber ? (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <p className="text-xs text-gray-600">Tracking Number</p>
                                          <div className="flex items-center mt-1">
                                            <p className="text-sm font-medium text-gray-900">
                                              {vendorOrder.trackingNumber}
                                            </p>
                                            {vendorOrder.carrier && (
                                              <a
                                                href={getTrackingLink(vendorOrder.trackingNumber, vendorOrder.carrier)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                                              >
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                Track
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-600">Carrier</p>
                                          <p className="text-sm font-medium text-gray-900">
                                            {vendorOrder.carrier || 'Not specified'}
                                          </p>
                                        </div>
                                      </div>
                                      {vendorOrder.shippedAt && (
                                        <div>
                                          <p className="text-xs text-gray-600">Shipped Date</p>
                                          <p className="text-sm font-medium text-gray-900">
                                            {formatDate(vendorOrder.shippedAt)}
                                          </p>
                                        </div>
                                      )}
                                      {vendorOrder.deliveredAt && (
                                        <div>
                                          <p className="text-xs text-gray-600">Delivered Date</p>
                                          <p className="text-sm font-medium text-gray-900">
                                            {formatDate(vendorOrder.deliveredAt)}
                                          </p>
                                        </div>
                                      )}
                                      <div className="pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-600">Last Updated</p>
                                        <p className="text-xs text-gray-500">
                                          {vendorOrder.updatedAt ? formatDate(vendorOrder.updatedAt) : 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No tracking information provided by vendor yet
                                    </p>
                                  )}
                                  {vendorOrder.updatedBy === 'vendor' && (
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-800">
                                      <div className="flex items-center">
                                        <CheckSquare className="w-3 h-3 mr-1" />
                                        <span>Updated by vendor</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
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