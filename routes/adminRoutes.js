const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAdminById,
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  changePassword,
  getAllUsers
} = require('../controllers/adminController');

// Configure Multer to store files on disk (profile picture) - TEMPORARY
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('Received file:', file.mimetype, file.originalname); // Debug log
  const allowedTypes = ['image/png', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, and .jpeg formats are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

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
