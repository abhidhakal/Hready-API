const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.post('/', protect, adminOnly, taskController.createTask);
router.get('/', protect, adminOnly, taskController.getTasks);
router.get('/:id', protect, adminOnly, taskController.getTaskById);
router.put('/:id', protect, adminOnly, taskController.updateTask);
router.delete('/:id', protect, adminOnly, taskController.deleteTask);

module.exports = router;
