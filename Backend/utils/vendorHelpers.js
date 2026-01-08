import jwt from 'jsonwebtoken';

export const generateToken = (vendorId, role) => {
    return jwt.sign(
        { id: vendorId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '8h' }
    );
};

export const setVendorTokenCookie = (res, token) => {
    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 8) * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false,        // localhost
        sameSite: 'lax',      // REQUIRED
        path: '/'
    };

    res.cookie('vendor_token', token, options);
};

export const clearVendorTokenCookie = (res) => {
    res.clearCookie('vendor_token', {
        path: '/'
    });
};