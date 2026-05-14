import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';

// @desc    Create new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;

    // Check if project exists and user is admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only admin can create tasks (usually)
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Only admins can create tasks' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      assignedTo: assignedTo || null,
    });

    // If assigned to someone, notify them
    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        text: `You have been assigned a new task: "${title}" in project "${project.name}"`,
        type: 'info',
      });
    }

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update task (status, assignee, etc)
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = req.body;
    
    // Logic for notifications on status change or assignee change
    if (updates.status && updates.status !== task.status) {
      // Notify project admin if a member finishes a task
      const project = await Project.findById(task.project);
      if (updates.status === 'Done') {
        await Notification.create({
          recipient: project.admin,
          text: `Task "${task.title}" has been completed!`,
          type: 'success',
        });
      }
    }

    if (updates.assignedTo && updates.assignedTo !== task.assignedTo?.toString()) {
      await Notification.create({
        recipient: updates.assignedTo,
        text: `You have been assigned to task: "${task.title}"`,
        type: 'info',
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
