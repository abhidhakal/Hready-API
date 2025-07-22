const express = require('express');
const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// admin-only actions
router.post('/', protect, adminOnly, createAnnouncement);
router.put('/:id', protect, adminOnly, updateAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

// public (employee can view too)
router.get('/', protect, getAllAnnouncements);

module.exports = router;
