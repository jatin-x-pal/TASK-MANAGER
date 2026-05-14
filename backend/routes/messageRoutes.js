import express from 'express';
import { getContacts, getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/contacts', getContacts);
router.route('/')
  .get(getMessages)
  .post(sendMessage);

export default router;
