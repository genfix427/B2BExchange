import express from 'express';
import { 
  getAllOrders,
  getVendorOrderStats,
  getVendorSellOrders,
  getVendorPurchaseOrders,
  getAdminDashboardStats,
  generateInvoice,
  exportOrdersToExcel,
  updateOrderStatus,
  updateVendorOrderStatus,
  getOrderAnalytics,
  getTopVendors // Add this function
} from '../../controllers/admin/order.controller.js';
import { adminProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Protect all admin routes
router.use(adminProtect);

// =====================
// DASHBOARD & ANALYTICS
// =====================
router.get('/dashboard/stats', getAdminDashboardStats);
router.get('/analytics', getOrderAnalytics);
router.get('/analytics/top-vendors', getTopVendors);

// =====================
// VENDOR-SPECIFIC ROUTES (MOVE THESE UP)
// =====================
router.get('/vendors/:id/stats', getVendorOrderStats);
router.get('/vendors/:id/orders/sell', getVendorSellOrders);
router.get('/vendors/:id/orders/purchase', getVendorPurchaseOrders);

// =====================
// GENERAL ORDERS
// =====================
router.get('/', getAllOrders);
router.get('/export', exportOrdersToExcel);

// =====================
// ORDER ACTIONS (KEEP LAST)
// =====================
router.get('/:id/invoice', generateInvoice);
router.put('/:id/status', updateOrderStatus);
router.put('/:orderId/vendor/:vendorId/status', updateVendorOrderStatus);

export default router;
