// backend/utils/vendorHelpers.js

import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for vendor
 */
export const generateToken = (vendorId, role = 'vendor') => {
  return jwt.sign(
    { id: vendorId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '8h' }
  );
};

/**
 * Set vendor token cookie (Render + localhost safe)
 */
export const setVendorTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,                 // ✅ true on Render
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000             // 8 hours
  };

  res.cookie('vendor_token', token, cookieOptions);

  console.log('🍪 vendor_token cookie set:', cookieOptions);
};

/**
 * Clear vendor token cookie
 */
export const clearVendorTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('vendor_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });

  console.log('🧹 vendor_token cookie cleared');
};
