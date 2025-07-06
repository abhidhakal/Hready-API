const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAdminById,
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  changePassword,
  getAllUsers
} = require('../controllers/adminController');

// Configure Multer to store in memory (profile picture)
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// Get specific admin by ID
router.get('/:id', protect, adminOnly, getAdminById);

// Get all users (if needed)
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
