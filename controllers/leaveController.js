const Leave = require('../models/Leave');
const User = require('../models/User');

// Employee: Create leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, halfDay } = req.body;

    const leave = new Leave({
      requestedBy: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      halfDay: halfDay === 'true', // if sent as string
      attachment: req.file ? req.file.path : null
    });

    await leave.save();
    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Employee: Get own leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ requestedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('requestedBy', 'name email role').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.status = status;
    leave.adminComment = adminComment || '';
    await leave.save();

    res.json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Create own leave (auto-approved)
exports.createAdminLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, halfDay } = req.body;

    const leave = new Leave({
      requestedBy: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      halfDay: halfDay === 'true',
      attachment: req.file ? req.file.path : null,
      status: 'Approved'
    });

    await leave.save();
    res.status(201).json({ message: 'Admin leave recorded', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
