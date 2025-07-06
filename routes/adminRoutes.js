const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAdminById,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getAllUsers
} = require('../controllers/adminController');

router.get('/me', protect, adminOnly, getMyProfile);
router.put('/me', protect, adminOnly, updateMyProfile);
router.put('/change-password', protect, adminOnly, changePassword);

router.get('/:id', protect, adminOnly, getAdminById);
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
