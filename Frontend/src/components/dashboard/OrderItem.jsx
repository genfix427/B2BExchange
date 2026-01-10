import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Package, Truck, CheckCircle, Clock } from 'lucide-react';

const OrderItem = ({ order }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'shipped':
      case 'delivered':
        return Truck;
      case 'processing':
      case 'confirmed':
        return Package;
      case 'pending':
        return Clock;
      default:
        return CheckCircle;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0 hover:bg-gray-50">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${getStatusColor(order.status)}`}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">
            Order #{order.orderNumber || order._id?.substring(0, 8)}
          </p>
          <div className="flex items-center mt-1 space-x-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {order.customerName || 'Unknown Customer'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(order.total)}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Link
          to={`/vendor/orders/${order._id}`}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="View Order"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderItem;