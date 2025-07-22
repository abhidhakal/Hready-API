const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  checkIn,
  checkOut,
  getMonthlySummary,
  sendReminder,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');

// Employee check-in and check-out
router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);

// Employee summary and reminders
router.get('/summary', protect, getMonthlySummary);
router.post('/reminders', protect, sendReminder);

// Attendance records
router.get('/all', protect, getAllAttendance);
router.get('/me', protect, getTodayAttendance);
router.get('/', protect, getMyAttendance);

module.exports = router;
