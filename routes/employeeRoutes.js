const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

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
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, and .jpeg formats are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

const {
  getAllEmployees,
  getMyProfile,
  changePassword,
  uploadProfilePicture,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/userEmployeeController');

const router = express.Router();

// Employee self-management
router.get('/me', protect, getMyProfile);
router.put('/change-password', protect, changePassword);
router.put(
  '/upload-profile-picture',
  protect,
  upload.single('profilePicture'),
  uploadProfilePicture
);

// Admin employee management
router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, createEmployee);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
