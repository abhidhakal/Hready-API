const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const PayrollSettings = require('../models/PayrollSettings');

// Get salary budget
router.get('/payroll-budget', protect, adminOnly, async (req, res) => {
  const setting = await PayrollSettings.findOne({ key: 'payrollBudget' });
  res.json({ budget: setting ? setting.value : null });
});

// Set salary budget
router.put('/payroll-budget', protect, adminOnly, async (req, res) => {
  const { budget } = req.body;
  let setting = await PayrollSettings.findOneAndUpdate(
    { key: 'payrollBudget' },
    { value: budget },
    { new: true, upsert: true }
  );
  res.json({ budget: setting.value });
});

module.exports = router; 