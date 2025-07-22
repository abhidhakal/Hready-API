const express = require('express');
const {
  getAllSalaries,
  getSalaryByEmployee,
  createSalary,
  updateSalary,
  deleteSalary,
  getSalaryHistory,
  getSalaryStats
} = require('../controllers/salaryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', adminOnly, getAllSalaries);
router.post('/', adminOnly, createSalary);
router.put('/:id', adminOnly, updateSalary);
router.delete('/:id', adminOnly, deleteSalary);
router.get('/stats', adminOnly, getSalaryStats);

// Employee can access their own salary
router.get('/employee/:employeeId', getSalaryByEmployee);
router.get('/employee/:employeeId/history', getSalaryHistory);

module.exports = router; 