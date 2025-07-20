const express = require('express');
const {
  getAllBankAccounts,
  getBankAccountsByEmployee,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
} = require('../controllers/bankAccountController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', adminOnly, getAllBankAccounts);
router.post('/', adminOnly, createBankAccount);
router.put('/:id', adminOnly, updateBankAccount);
router.delete('/:id', adminOnly, deleteBankAccount);
router.put('/:id/set-default', adminOnly, setDefaultBankAccount);

// Employee can access their own bank accounts
router.get('/employee/:employeeId', getBankAccountsByEmployee);

module.exports = router; 