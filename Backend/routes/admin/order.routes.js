// routes/admin/order.routes.js
import express from 'express';
import { 
  getAllOrders,
  getAdminDashboardStats,
  getOrderAnalytics,
  getRecentOrders,
  getTopVendors,
  getVendorOrderStats,
  getVendorSellOrders,
  getVendorPurchaseOrders,
  generateInvoice,
  exportOrdersToExcel,
  updateOrderStatus,
  updateVendorOrderStatus,
  getOrderDetails
} from '../../controllers/admin/order.controller.js';
import { adminProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes protected for admin
router.use(adminProtect);

// Dashboard and analytics
router.get('/dashboard/stats', getAdminDashboardStats);
router.get('/analytics', getOrderAnalytics);
router.get('/recent', getRecentOrders);
router.get('/top-vendors', getTopVendors);

// All orders
router.get('/', getAllOrders);

// Vendor-specific routes
router.get('/vendors/:id/stats', getVendorOrderStats);
router.get('/vendors/:id/orders/sell', getVendorSellOrders);
router.get('/vendors/:id/orders/purchase', getVendorPurchaseOrders);
router.put('/:orderId/vendor/:vendorId/status', updateVendorOrderStatus);
router.get('/:id', getOrderDetails);

// Order operations
router.get('/:id/invoice', generateInvoice);
router.put('/:id/status', updateOrderStatus);

export default router;