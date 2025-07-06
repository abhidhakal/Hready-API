const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/userEmployeeController');

const router = express.Router();

router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, createEmployee);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
