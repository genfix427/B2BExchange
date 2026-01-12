import jwt from 'jsonwebtoken';

export const generateAdminToken = (adminId, role) => {
  return jwt.sign(
    { _id: adminId, role },
    process.env.JWT_SECRET || 'admin-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '8h' }
  );
};

export const setAdminTokenCookie = (res, token) => {
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 8) * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  console.log('🍪 Setting admin_token cookie with options:', {
    expires: options.expires,
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });

  res.cookie('admin_token', token, {
  httpOnly: true,
  secure: true,        // REQUIRED on Render
  sameSite: 'none',   // REQUIRED for cross-site
  path: '/',
  maxAge: 8 * 60 * 60 * 1000
});

};

export const clearAdminTokenCookie = (res) => {
  res.cookie('admin_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    sameSite: 'strict',
    path: '/'
  });
};