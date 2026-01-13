import express from 'express';
import { 
  getVendorAnalyticsOverview,
  getVendorPerformanceMetrics,
  getVendorGrowthTrends,
  getVendorStatusDistribution,
  getTopPerformingVendors,
  getVendorRegistrationTrends,
  exportVendorAnalytics
} from '../../controllers/admin/vendorAnalytics.controller.js';
import { adminProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes protected for admin
router.use(adminProtect);

// Vendor analytics
router.get('/overview', getVendorAnalyticsOverview);
router.get('/performance', getVendorPerformanceMetrics);
router.get('/growth', getVendorGrowthTrends);
router.get('/status-distribution', getVendorStatusDistribution);
router.get('/top-performing', getTopPerformingVendors);
router.get('/registrations', getVendorRegistrationTrends);
router.get('/export', exportVendorAnalytics);

export default router;