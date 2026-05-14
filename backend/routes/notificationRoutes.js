import express from 'express';
import { getNotifications, markAsRead, clearNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.delete('/', clearNotifications);
router.put('/:id/read', markAsRead);

export default router;
