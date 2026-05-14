import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

// @desc    Get all projects for current user
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    // Find projects where user is either admin or a member
    const projects = await Project.find({
      $or: [
        { admin: req.user._id },
        { members: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      admin: req.user._id,
      members: [req.user._id], // Admin is the first member
    });

    // Create a notification for the user
    await Notification.create({
      recipient: req.user._id,
      text: `New project "${name}" has been created successfully!`,
      type: 'success',
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email profileImage');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only admin can delete
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized to delete this project' });
    }

    await project.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
