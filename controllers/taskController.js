const Task = require('../models/Task');
const Employee = require('../models/Employee');

exports.createTask = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, description, dueDate, assignedTo, assignedDepartment, status } = req.body;

    // Validate assignedTo
    let assignedEmployee = null;
    if (assignedTo) {
      assignedEmployee = await Employee.findById(assignedTo);
      if (!assignedEmployee) {
        return res.status(400).json({ message: 'Assigned employee not found.' });
      }
    }

    // Ensure only one assignment
    let finalAssignedTo = assignedEmployee ? assignedEmployee._id : null;
    let finalAssignedDepartment = assignedDepartment || null;

    if (finalAssignedTo && finalAssignedDepartment) {
      finalAssignedDepartment = null;
    }

    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: finalAssignedTo,
      assignedDepartment: finalAssignedDepartment,
      status: status || 'pending',
      createdBy: req.user._id
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'userId')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'userId')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
