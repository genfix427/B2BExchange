import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables FIRST
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';
import adminAuthRoutes from './routes/adminAuth.routes.js';

import vendorProductRoutes from './routes/vendor/product.routes.js';
import storeProductRoutes from './routes/store/product.routes.js';
import adminProductRoutes from './routes/admin/product.routes.js';

import cartRoutes from './routes/store/cart.routes.js';
import wishlistRoutes from './routes/store/wishlist.routes.js';
import orderRoutes from './routes/store/order.routes.js';
import vendorOrderRoutes from './routes/vendor/order.routes.js';
import checkoutRoutes from './routes/store/checkout.routes.js';

import schedulerService from './services/scheduler.service.js';

// Import middleware
import errorHandler from './middleware/error.middleware.js';

// Import DB
import connectDB from './config/db.js';

const app = express();

/* =========================
   CORS CONFIG (ONLY ONCE)
========================= */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-type',
  ],
};

app.use(cors(corsOptions));

schedulerService.init();


/* =========================
   BODY PARSERS
========================= */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* =========================
   SECURITY
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* =========================
   COOKIES
========================= */
app.use(cookieParser());

/* =========================
   RATE LIMITING
========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// app.use('/api/auth', authLimiter);
app.use('/api/vendor/auth', authRoutes);
app.use('/api/admin', authLimiter);
app.use('/api/admin/auth', adminAuthRoutes);

app.use('/api/vendor/products', vendorProductRoutes);
app.use('/api/store/products', storeProductRoutes);
app.use('/api/admin/products', adminProductRoutes);

app.use('/api/store/cart', cartRoutes);
app.use('/api/store/wishlist', wishlistRoutes);
app.use('/api/store/orders', orderRoutes);
app.use('/api/vendor/orders', vendorOrderRoutes);
app.use('/api/store/checkout', checkoutRoutes);

/* =========================
   STATIC FILES
========================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
