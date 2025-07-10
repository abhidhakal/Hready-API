const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createLeaveRequest,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  createAdminLeave
} = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');


// Employee create leave
router.post('/', protect, upload.single('attachment'), createLeaveRequest);

// Employee get own leaves
router.get('/', protect, getMyLeaves);

// Admin get all leaves
router.get('/all', protect, adminOnly, getAllLeaves);

// Admin update leave status
router.put('/:id/status', protect, adminOnly, updateLeaveStatus);

// Admin create own leave
router.post('/admin', protect, adminOnly, upload.single('attachment'), createAdminLeave);

module.exports = router;
