const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
