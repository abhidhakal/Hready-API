const Attendance = require('../models/Attendance');
// const LeaveRequest = require('../models/LeaveRequest');

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const record = await Attendance.findOne({
      employeeId: req.user.id,
      date: today
    });

    if (!record) {
      return res.status(404).json({ message: 'No attendance found for today.' });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      employeeId: req.user.id
    }).sort({ date: -1 }); // most recent first
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Checkin
const checkIn = async (req, res) => {
  const date = req.body.date ? new Date(req.body.date) : new Date();
  date.setHours(0,0,0,0);
  try {
    // Prevent duplicate checkins
    const existing = await Attendance.findOne({ employeeId: req.user.id, date });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in for this date.' });
    }

    const attendance = await Attendance.create({
      employeeId: req.user.id,
      date,
      check_in_time: new Date(),
      status: 'present',
      verification: { verified: true, method: 'qr', verifiedAt: new Date() }
    });

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Checkout
const checkOut = async (req, res) => {
  const date = req.body.date ? new Date(req.body.date) : new Date();
  date.setHours(0,0,0,0);
  try {
    const record = await Attendance.findOne({
      employeeId: req.user.id,
      date
    });

    if (!record) return res.status(404).json({ message: 'No check-in found.' });
    if (record.check_out_time) return res.status(400).json({ message: 'Already checked out.' });

    const checkOutTime = new Date();
    const totalHours = (checkOutTime - record.check_in_time) / (1000 * 60 * 60);

    record.check_out_time = checkOutTime;
    record.total_hours = totalHours.toFixed(2);
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Monthly Summary
const getMonthlySummary = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  try {
    const records = await Attendance.find({
      employeeId: req.user.id,
      date: { $gte: start, $lte: end }
    });

    const summary = {
      totalDays: records.length,
      present: records.filter(r => r.status === 'present').length,
      onLeave: records.filter(r => r.status === 'on leave').length,
      totalHours: records.reduce((acc, r) => acc + (r.total_hours || 0), 0).toFixed(2)
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Smart Reminder API placeholder
const sendReminder = async (req, res) => {
  // Later: implement email/notifications
  res.json({ message: 'Reminder logic not implemented yet.' });
};

module.exports = {
    getTodayAttendance,
    checkIn,
    checkOut,
    getMonthlySummary,
    sendReminder,
    getMyAttendance
};
