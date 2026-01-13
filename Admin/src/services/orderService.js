import { api } from './api';

export const orderService = {
  // Get vendor sell orders (where vendor is seller)
  async getVendorSellOrders(vendorId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = `/admin/orders/vendors/${vendorId}/orders/sell${queryString ? `?${queryString}` : ''}`;
      console.log('Fetching vendor sell orders from URL:', url);
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching vendor sell orders:', error);
      throw error;
    }
  },

  // Get vendor purchase orders (where vendor is buyer)
  async getVendorPurchaseOrders(vendorId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = `/admin/orders/vendors/${vendorId}/orders/purchase${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching vendor purchase orders:', error);
      throw error;
    }
  },

  // Get vendor order statistics
  async getVendorOrderStats(vendorId, period = 'month') {
    try {
      return await api.get(`/admin/orders/vendors/${vendorId}/stats?period=${period}`);
    } catch (error) {
      console.error('Error fetching vendor order stats:', error);
      throw error;
    }
  },

  // Get order details
  async getOrderDetails(orderId) {
    try {
      return await api.get(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId, data) {
    try {
      return await api.put(`/admin/orders/${orderId}/status`, data);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update vendor order status
  async updateVendorOrderStatus(orderId, vendorId, data) {
    try {
      return await api.put(`/admin/orders/${orderId}/vendor/${vendorId}/status`, data);
    } catch (error) {
      console.error('Error updating vendor order status:', error);
      throw error;
    }
  },

  // Generate invoice
  async generateInvoice(orderId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/orders/${orderId}/invoice`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  },

//==================================================================
  // Get admin dashboard stats
  async getDashboardStats() {
    try {
      return await api.get('/admin/dashboard/stats');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get all orders
  async getAllOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.vendorId) queryParams.append('vendorId', params.vendorId);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get order analytics
  async getOrderAnalytics(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const queryString = queryParams.toString();
      const url = `/admin/orders/analytics${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  },

  // Get recent orders
  async getRecentOrders(limit = 10) {
    try {
      return await api.get(`/admin/orders?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  // Get top vendors
  async getTopVendors(limit = 5) {
    try {
      return await api.get(`/admin/orders/analytics/top-vendors?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching top vendors:', error);
      throw error;
    }
  },

  // Export orders
  async exportOrders(type = 'all', filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('type', type);
      
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const queryString = queryParams.toString();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/orders/export?${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export orders');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  },
};