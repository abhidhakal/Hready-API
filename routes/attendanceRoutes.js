const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  checkIn,
  checkOut,
  getMonthlySummary,
  sendReminder,
  getTodayAttendance,
  getMyAttendance
} = require('../controllers/attendanceController');

router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);
router.get('/summary', protect, getMonthlySummary);
router.post('/reminders', protect, sendReminder);
router.get('/me', protect, getTodayAttendance);
router.get('/', protect, getMyAttendance);

module.exports = router;
