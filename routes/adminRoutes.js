const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAdminById, getAllUsers } = require('../controllers/adminController');

// Get admin by ID
router.get('/:id', protect, adminOnly, getAdminById);

router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
