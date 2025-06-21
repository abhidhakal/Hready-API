const express = require('express');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const router = express.Router();

// keeping admin only access
router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, createEmployee);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;