import express from 'express';
import { getProjects, createProject, getProject, deleteProject, getProjectBoard, addMember } from '../controllers/projectController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .delete(deleteProject);

router.get('/:id/board', getProjectBoard);
router.put('/:id/add-member', addMember);

export default router;

