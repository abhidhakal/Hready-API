const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users (admin only)
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
