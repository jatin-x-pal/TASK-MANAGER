import express from 'express';
import { getActivities, getSchedules } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.get('/schedules', getSchedules);

export default router;
