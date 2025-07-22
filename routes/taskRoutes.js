const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, taskController.createTask);
router.get('/', protect, adminOnly, taskController.getTasks);

// Employee: Get their own tasks
router.get('/my', protect, taskController.getMyTasks);

// Employee: Update their own task status
router.put('/my/:id/status', protect, taskController.updateMyTaskStatus);

router.get('/:id', protect, adminOnly, taskController.getTaskById);
router.put('/:id', protect, adminOnly, taskController.updateTask);
router.delete('/:id', protect, adminOnly, taskController.deleteTask);

module.exports = router;
