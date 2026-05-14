import TimeOff from '../models/TimeOff.js';

// @desc    Get all time off requests for user + summary
// @route   GET /api/time-off
export const getTimeOff = async (req, res) => {
  try {
    const requests = await TimeOff.find({ userId: req.user._id }).sort({ startDate: -1 });

    // Calculate summary
    const TOTAL_QUOTA = 20;
    const approvedRequests = requests.filter(r => r.status === 'Approved');
    
    let daysUsed = 0;
    approvedRequests.forEach(req => {
      const diffTime = Math.abs(new Date(req.endDate) - new Date(req.startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
      daysUsed += diffDays;
    });

    res.status(200).json({
      success: true,
      data: requests,
      summary: {
        total: TOTAL_QUOTA,
        used: daysUsed,
        left: Math.max(0, TOTAL_QUOTA - daysUsed)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Request time off
// @route   POST /api/time-off
export const requestTimeOff = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    const timeOff = await TimeOff.create({
      userId: req.user._id,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: timeOff
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update status (Admin only)
// @route   PUT /api/time-off/:id
export const updateTimeOffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // In a real app, check if user is admin
    // For now, we'll allow it for demonstration
    
    const timeOff = await TimeOff.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!timeOff) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      data: timeOff
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
