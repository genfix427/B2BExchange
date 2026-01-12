// src/services/auth.service.js
import { api } from './api';

export const authService = {
  // ========================
  // LOGIN
  // ========================
  async login(email, password) {
    const response = await api.post('/admin/auth/login', {
      email,
      password
    });

    // Store ONLY non-sensitive info
    localStorage.setItem('adminUser', JSON.stringify(response.data));
    localStorage.setItem(
      'adminPermissions',
      JSON.stringify(response.data.permissions || {})
    );

    return response.data;
  },

  // ========================
  // LOGOUT
  // ========================
  async logout() {
    try {
      await api.post('/admin/auth/logout');
    } finally {
      this.clearAdminStorage();
    }
  },

  // ========================
  // CURRENT ADMIN
  // ========================
  async getCurrentAdmin() {
    // 🔥 NEVER check cookies in frontend
    const response = await api.get('/admin/auth/me');

    localStorage.setItem('adminUser', JSON.stringify(response.data));
    localStorage.setItem(
      'adminPermissions',
      JSON.stringify(response.data.permissions || {})
    );

    return response.data;
  },

  // ========================
  // PASSWORD
  // ========================
  forgotPassword(email) {
    return api.post('/admin/auth/forgot-password', { email });
  },

  resetPassword(token, password) {
    return api.post(`/admin/auth/reset-password/${token}`, { password });
  },

  // ========================
  // HELPERS
  // ========================
  clearAdminStorage() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPermissions');
  },

  getStoredAdmin() {
    try {
      return JSON.parse(localStorage.getItem('adminUser'));
    } catch {
      return null;
    }
  },

  isAdminAuthenticated() {
    // ✅ Trust backend, not cookies
    return !!this.getStoredAdmin();
  },

  getAdminPermissions() {
    try {
      return JSON.parse(localStorage.getItem('adminPermissions')) || {};
    } catch {
      return {};
    }
  },

  hasPermission(permission) {
    return this.getAdminPermissions()[permission] === true;
  },

  // Check if we have valid cookies
  checkCookies() {
    return {
      hasAdminToken: cookieHelper.hasAdminToken(),
      adminToken: cookieHelper.getAdminToken(),
      allCookies: document.cookie
    }
  }
}