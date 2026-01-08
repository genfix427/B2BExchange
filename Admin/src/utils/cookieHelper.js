// Helper to check and manage cookies
export const cookieHelper = {
  // Check if admin_token cookie exists
  hasAdminToken() {
    return document.cookie.includes('admin_token=');
  },

  // Get admin_token from cookies
  getAdminToken() {
    const match = document.cookie.match(/admin_token=([^;]+)/);
    return match ? match[1] : null;
  },

  // Check if any token exists
  hasAnyToken() {
    return document.cookie.includes('admin_token=') || 
           document.cookie.includes('vendor_token=') || 
           document.cookie.includes('token=');
  },

  // Clear all auth cookies
  clearAllAuthCookies() {
    const cookies = ['admin_token', 'vendor_token', 'token'];
    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  },

  // Clear only admin token
  clearAdminToken() {
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  // Check all cookies (debug function)
  checkCookies() {
    console.log('=== COOKIE DEBUG ===');
    console.log('Document cookies:', document.cookie);
    
    const cookies = document.cookie.split(';');
    console.log('Parsed cookies:');
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      console.log(`- ${name}: ${value ? '***' : 'empty'}`);
    });
    
    console.log('Has admin_token:', this.hasAdminToken());
    console.log('Has vendor_token:', document.cookie.includes('vendor_token='));
    console.log('Has token:', document.cookie.includes('token='));
    console.log('=== END DEBUG ===');
    
    return {
      hasAdminToken: this.hasAdminToken(),
      adminToken: this.getAdminToken(),
      allCookies: document.cookie
    };
  }
};