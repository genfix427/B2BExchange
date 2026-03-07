// routes/vendor/notification.routes.js
import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../../controllers/vendor/notification.controller.js';
import { vendorProtect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(vendorProtect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;