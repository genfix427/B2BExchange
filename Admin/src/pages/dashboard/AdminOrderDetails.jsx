import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
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
  Copy,
  DollarSign,
  Box,
  Hash,
  Home,
  ShoppingBag,
  Printer,
  Receipt,
  ChevronRight,
  Check,
  X,
  Info,
  Navigation,
  Map,
  MapPin as MapPinIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchOrderDetails, updateOrderStatus } from '../../store/slices/orderSlice';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentOrder?.data) {
      setNewStatus(currentOrder.data.status || '');
    }
  }, [currentOrder]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateShort = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'h:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      packed: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      partially_shipped: 'bg-orange-100 text-orange-800',
      partially_delivered: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      packed: Box,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: AlertCircle,
      partially_shipped: Truck,
      partially_delivered: CheckCircle
    };
    return icons[status] || Clock;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getTrackingStatusColor = (status) => {
    const colors = {
      'label_created': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'exception': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.pending;
  };

  const getTrackingStatusIcon = (status) => {
    const icons = {
      'label_created': FileText,
      'picked_up': Package,
      'in_transit': Truck,
      'out_for_delivery': Navigation,
      'delivered': CheckCircle,
      'exception': AlertCircle,
      'pending': Clock
    };
    return icons[status] || Clock;
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleUpdateStatus = () => {
    if (!currentOrder?.data?._id) return;
    
    dispatch(updateOrderStatus({
      orderId: currentOrder.data._id,
      data: {
        status: newStatus,
        note: 'Status updated by admin'
      }
    })).then(() => {
      setIsEditingStatus(false);
      dispatch(fetchOrderDetails(id));
    });
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    // Add toast notification here if needed
  };

  // Generate tracking timeline data
  const getTrackingTimeline = (vendorOrder) => {
    const timeline = [];
    
    // Add order created
    timeline.push({
      status: 'order_created',
      title: 'Order Placed',
      description: 'Order was successfully placed',
      date: vendorOrder.createdAt || vendorOrder.order?.createdAt,
      completed: true,
      icon: CheckCircle
    });

    // Add order confirmed
    if (vendorOrder.status !== 'pending') {
      timeline.push({
        status: 'order_confirmed',
        title: 'Order Confirmed',
        description: 'Vendor confirmed the order',
        date: vendorOrder.confirmedAt || vendorOrder.updatedAt,
        completed: true,
        icon: CheckCircle
      });
    }

    // Add processing
    if (['processing', 'packed', 'shipped', 'delivered'].includes(vendorOrder.status)) {
      timeline.push({
        status: 'processing',
        title: 'Processing',
        description: 'Order is being processed',
        date: vendorOrder.updatedAt,
        completed: true,
        icon: Package
      });
    }

    // Add packed
    if (['packed', 'shipped', 'delivered'].includes(vendorOrder.status)) {
      timeline.push({
        status: 'packed',
        title: 'Packed',
        description: 'Items have been packed',
        date: vendorOrder.updatedAt,
        completed: true,
        icon: Box
      });
    }

    // Add shipped
    if (vendorOrder.shippedAt) {
      timeline.push({
        status: 'shipped',
        title: 'Shipped',
        description: `Shipped via ${vendorOrder.carrier || 'carrier'}`,
        date: vendorOrder.shippedAt,
        completed: true,
        icon: Truck
      });
    } else if (vendorOrder.status === 'shipped' || vendorOrder.status === 'delivered') {
      timeline.push({
        status: 'shipped',
        title: 'Shipped',
        description: 'Order has been shipped',
        date: vendorOrder.updatedAt,
        completed: true,
        icon: Truck
      });
    }

    // Add delivered
    if (vendorOrder.deliveredAt) {
      timeline.push({
        status: 'delivered',
        title: 'Delivered',
        description: 'Package has been delivered',
        date: vendorOrder.deliveredAt,
        completed: true,
        icon: Check
      });
    } else if (vendorOrder.status === 'delivered') {
      timeline.push({
        status: 'delivered',
        title: 'Delivered',
        description: 'Order has been delivered',
        date: vendorOrder.updatedAt,
        completed: true,
        icon: Check
      });
    }

    // Add cancelled if applicable
    if (vendorOrder.status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        title: 'Cancelled',
        description: vendorOrder.notes || 'Order was cancelled',
        date: vendorOrder.updatedAt,
        completed: true,
        icon: X
      });
    }

    return timeline;
  };

  // Mock tracking events for demonstration
  const getTrackingEvents = (vendorOrder) => {
    const events = [
      {
        status: 'label_created',
        description: 'Shipping label created',
        location: 'Warehouse Facility',
        date: vendorOrder.createdAt,
        icon: FileText
      },
      {
        status: 'picked_up',
        description: 'Package picked up by carrier',
        location: 'Distribution Center',
        date: vendorOrder.shippedAt,
        icon: Package
      },
      {
        status: 'in_transit',
        description: 'Package in transit',
        location: 'In Transit',
        date: new Date(new Date(vendorOrder.shippedAt || new Date()).getTime() + 3600000), // 1 hour later
        icon: Truck
      },
      {
        status: 'out_for_delivery',
        description: 'Out for delivery',
        location: 'Local Distribution',
        date: new Date(new Date(vendorOrder.shippedAt || new Date()).getTime() + 7200000), // 2 hours later
        icon: Navigation
      },
      {
        status: 'delivered',
        description: 'Delivered',
        location: 'Destination',
        date: vendorOrder.deliveredAt || (vendorOrder.status === 'delivered' ? vendorOrder.updatedAt : null),
        icon: CheckCircle
      }
    ];

    return events.filter(event => event.date);
  };

  const getTrackingLink = (trackingNumber, carrier) => {
    if (!trackingNumber) return '#';

    const normalizedCarrier = (carrier || '').toLowerCase();

    if (normalizedCarrier.includes('ups')) {
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    } else if (normalizedCarrier.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
    } else if (normalizedCarrier.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    } else if (normalizedCarrier.includes('dhl')) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    }

    return '#';
  };

  if (loading || currentOrder?.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || currentOrder?.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Order</h3>
            <p className="text-gray-600 mb-6">{error || currentOrder?.error}</p>
            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const order = currentOrder?.data;
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-6">The requested order could not be found.</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="mr-4 p-2 rounded-full hover:bg-emerald-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Order Details</h1>
                  <p className="text-emerald-200 text-sm mt-1">
                    Order #{order.orderNumber} • {formatDateShort(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.print()}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => copyToClipboard(order.orderNumber)}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Current status: {order.status?.replace('_', ' ') || 'Pending'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-lg flex items-center ${getStatusColor(order.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium capitalize">
                      {(order.status || 'pending').replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditingStatus(!isEditingStatus)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditingStatus ? 'Cancel' : 'Edit Status'}
                  </button>
                </div>
              </div>

              {isEditingStatus && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpdateStatus}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update Status
                      </button>
                      <button
                        onClick={() => setIsEditingStatus(false)}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Order Number</div>
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{order.orderNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Order Date</div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 capitalize">
                        {order.paymentMethod?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{formatDate(order.updatedAt)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Items</div>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} units
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Tracking Section */}
            {order.vendorOrders && order.vendorOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mr-4">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Tracking Details</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {order.vendorOrders.map((vendorOrder, index) => {
                      const trackingEvents = getTrackingEvents(vendorOrder);
                      const timeline = getTrackingTimeline(vendorOrder);
                      const VendorStatusIcon = getStatusIcon(vendorOrder.status);

                      return (
                        <div key={index} className="border border-gray-200 rounded-xl p-5">
                          {/* Vendor Header */}
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-md font-semibold text-gray-900">
                                {vendorOrder.vendorName || 'Vendor'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Vendor Order Status: <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendorOrder.status)}`}>
                                  <VendorStatusIcon className="w-3 h-3 inline mr-1" />
                                  {vendorOrder.status}
                                </span>
                              </p>
                            </div>
                            
                            {/* Tracking Info */}
                            {vendorOrder.trackingNumber && (
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  Tracking: {vendorOrder.trackingNumber}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Carrier: {vendorOrder.carrier || 'Not specified'}
                                </div>
                                {vendorOrder.trackingNumber && (
                                  <a
                                    href={getTrackingLink(vendorOrder.trackingNumber, vendorOrder.carrier)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 mt-1"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Track on carrier website
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tracking Timeline */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Timeline</h4>
                            <div className="space-y-4">
                              {timeline.map((step, stepIndex) => {
                                const StepIcon = step.icon || CheckCircle;
                                return (
                                  <div key={stepIndex} className="flex items-start">
                                    <div className="flex-shrink-0">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <StepIcon className="w-4 h-4" />
                                      </div>
                                      {stepIndex < timeline.length - 1 && (
                                        <div className="w-0.5 h-4 bg-gray-200 mx-auto mt-2"></div>
                                      )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900 capitalize">
                                            {step.title.replace('_', ' ')}
                                          </p>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {step.description}
                                          </p>
                                        </div>
                                        {step.date && (
                                          <p className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(step.date)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Tracking Events */}
                          {vendorOrder.trackingNumber && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-4">Tracking Updates</h4>
                              <div className="space-y-3">
                                {trackingEvents.map((event, eventIndex) => {
                                  const EventIcon = event.icon || Info;
                                  const EventStatusIcon = getTrackingStatusIcon(event.status);
                                  
                                  return (
                                    <div key={eventIndex} className="flex items-start">
                                      <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTrackingStatusColor(event.status)}`}>
                                          <EventStatusIcon className="w-4 h-4" />
                                        </div>
                                        {eventIndex < trackingEvents.length - 1 && (
                                          <div className="w-0.5 h-8 bg-gray-200 mx-auto"></div>
                                        )}
                                      </div>
                                      <div className="ml-4 flex-1">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 capitalize">
                                              {event.description}
                                            </p>
                                            <div className="flex items-center mt-1 text-xs text-gray-600">
                                              <MapPinIcon className="w-3 h-3 mr-1" />
                                              {event.location}
                                            </div>
                                          </div>
                                          {event.date && (
                                            <div className="text-right">
                                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                                {formatDateShort(event.date)}
                                              </p>
                                              <p className="text-xs text-gray-400">
                                                {formatTime(event.date)}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Shipping Details */}
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Shipping Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Estimated Delivery</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {vendorOrder.deliveredAt ? 
                                    `Delivered on ${formatDateShort(vendorOrder.deliveredAt)}` :
                                    vendorOrder.status === 'shipped' ?
                                    'Within 3-5 business days' :
                                    'Will be updated after shipping'
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Package Weight</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {vendorOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} items • ~{vendorOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) * 0.5 || 0} kg
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mr-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NDC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {item.ndcNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.quantity || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(item.unitPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.vendorName || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Subtotal:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(order.subtotal)}
                        </td>
                        <td></td>
                      </tr>
                      {order.shippingCost > 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            Shipping:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(order.shippingCost)}
                          </td>
                          <td></td>
                        </tr>
                      )}
                      {order.tax > 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            Tax:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(order.tax)}
                          </td>
                          <td></td>
                        </tr>
                      )}
                      <tr className="bg-emerald-50">
                        <td colSpan="4" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-emerald-700">
                          {formatCurrency(order.total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Shipping */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Customer Name</div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {order.customerName || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email Address</div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={`mailto:${order.customerEmail}`}
                        className="font-medium text-emerald-600 hover:text-emerald-800"
                      >
                        {order.customerEmail || 'N/A'}
                      </a>
                    </div>
                  </div>
                  {order.customer?.phone && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="font-medium text-gray-900"
                        >
                          {order.customer.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {order.customer?.pharmacyInfo?.legalBusinessName && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Business Name</div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {order.customer.pharmacyInfo.legalBusinessName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                </div>
              </div>

              <div className="p-6">
                {order.shippingAddress ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Address Line 1</div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {order.shippingAddress.line1 || 'N/A'}
                        </span>
                      </div>
                    </div>
                    {order.shippingAddress.line2 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Address Line 2</div>
                        <div className="flex items-center">
                          <Home className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">
                            {order.shippingAddress.line2}
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">City, State, ZIP</div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {order.shippingAddress.city || ''}, {order.shippingAddress.state || ''} {order.shippingAddress.zipCode || ''}
                        </span>
                      </div>
                    </div>
                    {order.shippingAddress.phone && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <a
                            href={`tel:${order.shippingAddress.phone}`}
                            className="font-medium text-gray-900"
                          >
                            {order.shippingAddress.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Shipping Cost</div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(order.shippingCost || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No shipping address provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-gray-800 to-black rounded-xl mr-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Financial Summary</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
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
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Total Amount</span>
                      <span className="text-lg font-bold text-emerald-700">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => window.print()}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Order Summary
                  </button>
                  <button
                    onClick={() => copyToClipboard(`Order #${order.orderNumber}`)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Order Details
                  </button>
                  {order.customer?._id && (
                    <button
                      onClick={() => navigate(`/admin/customers/${order.customer._id}`)}
                      className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Customer Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;