const express = require('express');
const {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  getEmployeePayrollHistory,
  updatePayroll,
  approvePayroll,
  markPayrollAsPaid,
  getPayrollStats,
  deletePayroll
} = require('../controllers/payrollController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.post('/generate', adminOnly, generatePayroll);
router.get('/', adminOnly, getAllPayrolls);
router.put('/:id', adminOnly, updatePayroll);
router.put('/:id/approve', adminOnly, approvePayroll);
router.put('/:id/mark-paid', adminOnly, markPayrollAsPaid);
router.delete('/:id', adminOnly, deletePayroll);
router.get('/stats', adminOnly, getPayrollStats);

// Employee can access their own payroll
router.get('/:id', getPayrollById);
router.get('/employee/:employeeId/history', getEmployeePayrollHistory);

module.exports = router; 