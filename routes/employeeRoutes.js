const express = require('express');
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// Admin-only routes
router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, createEmployee);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);
router.get('/:id', protect, getEmployeeById);

module.exports = router;
