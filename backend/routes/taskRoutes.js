import express from 'express';
import { createTask, updateTask, deleteTask, addComment } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);

export default router;
