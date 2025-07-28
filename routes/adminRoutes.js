const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getAdminById,
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  changePassword,
  getAllUsers
} = require('../controllers/adminController');

// Get logged-in admin profile
router.get('/me', protect, adminOnly, getMyProfile);

// Update profile (name, email, contactNo)
router.put('/me', protect, adminOnly, updateMyProfile);

// Upload profile picture
router.put(
  '/upload-profile-picture',
  protect,
  adminOnly,
  upload.single('profilePicture'),
  uploadProfilePicture
);

// Change password
router.put('/change-password', protect, adminOnly, changePassword);

// Get all users
router.get('/', protect, adminOnly, getAllUsers);

// Get specific admin by ID
router.get('/:id', protect, adminOnly, getAdminById);

module.exports = router;
