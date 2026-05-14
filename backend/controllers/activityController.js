import Activity from '../models/Activity.js';
import Schedule from '../models/Schedule.js';

// @desc    Get activities for today
// @route   GET /api/activities
export const getActivities = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activities = await Activity.find({
      createdAt: { $gte: today }
    })
    .populate('userId', 'name profileImage')
    .populate('projectId', 'name')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get schedules (Meetings/Events)
// @route   GET /api/schedules
export const getSchedules = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tonight = new Date();
    tonight.setHours(23, 59, 59, 999);

    const schedules = await Schedule.find({
      userId: req.user._id,
      startTime: { $gte: today, $lte: tonight }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
