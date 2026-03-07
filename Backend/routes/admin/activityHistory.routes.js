import express from 'express';
import {
  getActivityHistory,
  getActivityStats,
  getAdminsList
} from '../../controllers/admin/activityHistory.controller.js';
import { adminProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(adminProtect);

router.get('/', getActivityHistory);
router.get('/stats', getActivityStats);
router.get('/admins', getAdminsList);

export default router;