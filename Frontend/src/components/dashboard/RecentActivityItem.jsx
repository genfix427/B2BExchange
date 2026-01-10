import React from 'react';
import { 
  Package, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';

const RecentActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'product_added':
        return Package;
      case 'order_received':
        return ShoppingBag;
      case 'order_shipped':
        return CheckCircle;
      case 'payment_received':
        return DollarSign;
      case 'stock_alert':
        return AlertCircle;
      case 'customer_registered':
        return UserPlus;
      default:
        return TrendingUp;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'product_added':
        return 'bg-blue-100 text-blue-600';
      case 'order_received':
        return 'bg-green-100 text-green-600';
      case 'order_shipped':
        return 'bg-purple-100 text-purple-600';
      case 'payment_received':
        return 'bg-emerald-100 text-emerald-600';
      case 'stock_alert':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
      </div>
    </div>
  );
};

export default RecentActivityItem;