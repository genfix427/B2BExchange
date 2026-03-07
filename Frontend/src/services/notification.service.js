// src/services/notification.service.js
import { api } from './api';

export const notificationService = {
  // Get notifications
  getNotifications(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.unreadOnly) query.append('unreadOnly', params.unreadOnly);
    return api.get(`/vendor/notifications?${query.toString()}`);
  },

  // Get unread count
  getUnreadCount() {
    return api.get('/vendor/notifications/unread-count');
  },

  // Mark as read
  markAsRead(notificationId) {
    return api.put(`/vendor/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead() {
    return api.put('/vendor/notifications/read-all');
  },

  // Delete notification
  deleteNotification(notificationId) {
    return api.delete(`/vendor/notifications/${notificationId}`);
  }
};