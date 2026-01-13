import { api } from './api';

export const vendorAnalyticsService = {
  // Get vendor analytics overview
  async getVendorAnalyticsOverview(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) queryParams.append('period', params.period);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      const queryString = queryParams.toString();
      const url = `/admin/analytics/vendors/overview${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      throw error;
    }
  },

  // Get vendor performance metrics
  async getVendorPerformanceMetrics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      const queryString = queryParams.toString();
      const url = `/admin/analytics/vendors/performance${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
      throw error;
    }
  },

  // Get vendor growth trends
  async getVendorGrowthTrends(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.groupBy) queryParams.append('groupBy', params.groupBy);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      const queryString = queryParams.toString();
      const url = `/admin/analytics/vendors/growth${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching vendor growth trends:', error);
      throw error;
    }
  },

  // Get vendor status distribution
  async getVendorStatusDistribution() {
    try {
      return await api.get('/admin/analytics/vendors/status-distribution');
    } catch (error) {
      console.error('Error fetching vendor status:', error);
      throw error;
    }
  },

  // Get top performing vendors
  async getTopPerformingVendors(limit = 10) {
    try {
      return await api.get(`/admin/analytics/vendors/top-performing?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching top vendors:', error);
      throw error;
    }
  },

  // Get vendor registration trends
  async getVendorRegistrationTrends(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.groupBy) queryParams.append('groupBy', params.groupBy);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      const queryString = queryParams.toString();
      const url = `/admin/analytics/vendors/registrations${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(url);
    } catch (error) {
      console.error('Error fetching registration trends:', error);
      throw error;
    }
  },

  // Export vendor analytics
  async exportVendorAnalytics(format = 'excel', filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.period) queryParams.append('period', filters.period);
      
      const queryString = queryParams.toString();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/analytics/vendors/export?${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export vendor analytics');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting vendor analytics:', error);
      throw error;
    }
  }
};