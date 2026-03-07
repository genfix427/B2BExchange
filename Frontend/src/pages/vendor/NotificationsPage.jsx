// src/pages/vendor/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Clock,
  Gift,
  DollarSign,
  ShoppingBag,
  X,
  Filter
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../store/slices/notificationSlice';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, pagination, loading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    dispatch(fetchNotifications({
      page: 1,
      limit: 20,
      unreadOnly: filter === 'unread'
    }));
  }, [dispatch, filter]);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }

    if (notification.type === 'offer_received') {
      navigate('/vendor/offers/received');
    } else if (['offer_accepted', 'offer_rejected', 'offer_countered', 'counter_accepted', 'counter_rejected'].includes(notification.type)) {
      navigate('/vendor/offers/sent');
    } else if (['order_created', 'new_order', 'order_shipped', 'order_delivered'].includes(notification.type)) {
      navigate('/vendor/orders');
    }
  };

  const handlePageChange = (page) => {
    dispatch(fetchNotifications({ page, limit: 20, unreadOnly: filter === 'unread' }));
  };

  const getNotificationIcon = (type) => {
    const icons = {
      offer_received: <Gift className="w-5 h-5 text-blue-500" />,
      offer_accepted: <Check className="w-5 h-5 text-green-500" />,
      counter_accepted: <Check className="w-5 h-5 text-green-500" />,
      offer_rejected: <X className="w-5 h-5 text-red-500" />,
      counter_rejected: <X className="w-5 h-5 text-red-500" />,
      offer_countered: <DollarSign className="w-5 h-5 text-orange-500" />,
      order_created: <ShoppingBag className="w-5 h-5 text-teal-500" />,
      new_order: <ShoppingBag className="w-5 h-5 text-teal-500" />,
      offer_expired: <Clock className="w-5 h-5 text-gray-500" />
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getNotificationBg = (type) => {
    const bgs = {
      offer_received: 'bg-blue-50',
      offer_accepted: 'bg-green-50',
      counter_accepted: 'bg-green-50',
      offer_rejected: 'bg-red-50',
      counter_rejected: 'bg-red-50',
      offer_countered: 'bg-orange-50',
      order_created: 'bg-teal-50',
      new_order: 'bg-teal-50'
    };
    return bgs[type] || 'bg-gray-50';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/vendor/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filter === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Unread
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/90 rounded-2xl shadow-xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications will appear here when you receive offers, orders, etc.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl ${getNotificationBg(notification.type)} flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.senderName && (
                        <span className="text-xs text-gray-400">from {notification.senderName}</span>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkRead(notification._id)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center py-6">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 px-3">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;