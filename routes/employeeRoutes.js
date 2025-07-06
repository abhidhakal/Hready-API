const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
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

// Employee self profile
router.get('/me', protect, getMyProfile);
router.put('/change-password', protect, changePassword);
router.put('/upload-profile-picture', protect, uploadProfilePicture);

// Admin management
router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, createEmployee);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
