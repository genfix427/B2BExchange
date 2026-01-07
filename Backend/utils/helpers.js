import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  if (!userId || !role) {
    throw new Error('User ID and role are required to generate token');
  }
  
  return jwt.sign(
    { 
      id: userId.toString(), // Ensure it's a string
      role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };

  res.cookie('token', token, cookieOptions);
};

export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    path: '/'
  });
};