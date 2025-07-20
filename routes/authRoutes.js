const express = require('express');
const { register, login, logout, getLoginStats } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to auth endpoints
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);

// Admin-only endpoint for login statistics
router.get('/stats', protect, adminOnly, getLoginStats);

module.exports = router;
