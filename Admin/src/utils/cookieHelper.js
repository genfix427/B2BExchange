// src/utils/cookieHelper.js

/**
 * ⚠️ IMPORTANT NOTE
 * --------------------------------------------------
 * HttpOnly cookies CANNOT be accessed via JavaScript.
 * This helper DOES NOT attempt to read cookies.
 * Authentication state MUST be verified via backend APIs.
 * --------------------------------------------------
 */

export const cookieHelper = {
  /**
   * ❌ NEVER USE document.cookie for auth
   * This always returns false for HttpOnly cookies
   */
  hasAdminToken() {
    console.warn(
      '[cookieHelper] hasAdminToken() called — HttpOnly cookies cannot be read in JS'
    );
    return false;
  },

  hasVendorToken() {
    console.warn(
      '[cookieHelper] hasVendorToken() called — HttpOnly cookies cannot be read in JS'
    );
    return false;
  },

  hasAnyToken() {
    console.warn(
      '[cookieHelper] hasAnyToken() called — HttpOnly cookies cannot be read in JS'
    );
    return false;
  },

  /**
   * ❌ Cannot read token value
   */
  getAdminToken() {
    console.warn(
      '[cookieHelper] getAdminToken() called — HttpOnly cookies are inaccessible'
    );
    return null;
  },

  getVendorToken() {
    console.warn(
      '[cookieHelper] getVendorToken() called — HttpOnly cookies are inaccessible'
    );
    return null;
  },

  /**
   * ❌ Cannot delete HttpOnly cookies from JS
   * Logout MUST be done via backend API
   */
  clearAdminToken() {
    console.warn(
      '[cookieHelper] clearAdminToken() called — HttpOnly cookies must be cleared server-side'
    );
  },

  clearVendorToken() {
    console.warn(
      '[cookieHelper] clearVendorToken() called — HttpOnly cookies must be cleared server-side'
    );
  },

  clearAllAuthCookies() {
    console.warn(
      '[cookieHelper] clearAllAuthCookies() called — HttpOnly cookies must be cleared server-side'
    );
  },

  /**
   * ✅ Correct auth verification method
   * Use backend endpoint instead
   */
  async verifyAdminSession(api) {
    try {
      const res = await api.get('/admin/auth/me');
      return {
        authenticated: true,
        user: res.data || res,
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error.message,
      };
    }
  },

  async verifyVendorSession(api) {
    try {
      const res = await api.get('/vendor/auth/me');
      return {
        authenticated: true,
        user: res.data || res,
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error.message,
      };
    }
  },

  /**
   * ✅ Debug helper (SAFE)
   */
  debug() {
    console.info('=== COOKIE DEBUG (SAFE MODE) ===');
    console.info('HttpOnly cookies are hidden from JavaScript');
    console.info('Use DevTools → Application → Cookies');
    console.info('Verify authentication via /auth/me endpoint');
    console.info('=== END DEBUG ===');

    return {
      readableCookies: document.cookie || '(none)',
      note: 'HttpOnly cookies are intentionally hidden',
    };
  },
};
