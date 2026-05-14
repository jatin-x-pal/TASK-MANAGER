import Message from '../models/Message.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get contacts and projects for the sidebar
// @route   GET /api/messages/contacts
export const getContacts = async (req, res) => {
  try {
    // Find all projects where user is admin or member
    const projects = await Project.find({
      $or: [
        { admin: req.user._id },
        { members: req.user._id }
      ]
    }).populate('members', 'name email profileImage');

    // Extract unique contacts from those projects
    const contactIds = new Set();
    projects.forEach(p => {
      contactIds.add(p.admin.toString());
      p.members.forEach(m => contactIds.add(m._id.toString()));
    });

    // Remove current user from contacts
    contactIds.delete(req.user._id.toString());

    const contacts = await User.find({
      _id: { $in: Array.from(contactIds) }
    }).select('name email profileImage');

    // Format projects for the frontend (marking them as groups)
    const projectGroups = projects.map(p => ({
      _id: p._id,
      name: p.name,
      color: p.color,
      isGroup: true
    }));

    res.status(200).json({
      success: true,
      currentUserId: req.user._id,
      data: {
        contacts: contacts.map(c => ({ ...c.toObject(), isGroup: false })),
        projects: projectGroups
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages
export const getMessages = async (req, res) => {
  try {
    const { receiverId, projectId } = req.query;
    let query = {};

    if (projectId) {
      // Group chat
      query = { projectId };
    } else if (receiverId) {
      // Direct message
      query = {
        $or: [
          { senderId: req.user._id, receiverId },
          { senderId: receiverId, receiverId: req.user._id }
        ]
      };
    } else {
      return res.status(400).json({ error: 'Please provide receiverId or projectId' });
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 })
      .limit(50);

    // Add a helper field for the frontend to easily identify "mine" vs "others"
    const formattedMessages = messages.map(m => {
      const msg = m.toObject();
      if (msg.senderId._id.toString() === req.user._id.toString()) {
        msg.senderId.name = 'You';
      }
      return msg;
    });

    res.status(200).json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, projectId, content } = req.body;

    const message = await Message.create({
      senderId: req.user._id,
      receiverId: receiverId || null,
      projectId: projectId || null,
      content
    });

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name profileImage');
    
    const result = populatedMessage.toObject();
    if (result.senderId._id.toString() === req.user._id.toString()) {
      result.senderId.name = 'You';
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
