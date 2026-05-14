import express from 'express';
import { getTimeOff, requestTimeOff, updateTimeOffStatus } from '../controllers/timeOffController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTimeOff)
  .post(requestTimeOff);

router.put('/:id', updateTimeOffStatus);

export default router;
