const Employee = require('../models/Employee');

// get all employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

// create employee
const createEmployee = async (req, res) => {
    const { name, email, password, profilePicture, contactNo, role, department, position, status} = req.body;

    try {
        const employee = new Employee({ name, email, password, profilePicture, contactNo, role, department, position, status});
        const saved = await employee.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

// get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    // If user is employee and requesting someone else's profile -> forbidden
    if (req.user.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// update employee
const updateEmployee = async (req, res) => {
    try {
        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {new: true,});
        if (!updated) return res.status(404).json({message: 'Employee not found'});
        res.json(updated);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}

// delete employee
const deleteEmployee = async (req, res) => {
    try {
        const deleted = await Employee.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({message: "Employee not found"});
        res.json({message: 'Employee deleted'});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
    