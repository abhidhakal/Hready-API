const Salary = require('../models/Salary');
const User = require('../models/User');

// Get all salaries (admin only)
const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employee', 'name email department position')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get salary by employee ID
const getSalaryByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const salary = await Salary.findOne({ 
      employee: employeeId, 
      status: 'active' 
    }).populate('employee', 'name email department position');

    if (!salary) {
      return res.status(404).json({ message: 'Salary not found' });
    }

    res.json(salary);
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new salary
const createSalary = async (req, res) => {
  try {
    const {
      employee,
      basicSalary,
      allowances,
      deductions,
      currency,
      effectiveDate,
      notes,
      taxPercentage,
      insurancePercentage,
      grossSalary,
      netSalary,
      totalAllowances,
      totalDeductions
    } = req.body;

    // Check if employee exists
    const employeeDoc = await User.findById(employee);
    if (!employeeDoc) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Deactivate previous active salary
    await Salary.updateMany(
      { employee: employee, status: 'active' },
      { status: 'inactive' }
    );

    // Create new salary
    const salary = await Salary.create({
      employee: employee,
      basicSalary,
      allowances: allowances || {},
      deductions: deductions || {},
      currency,
      effectiveDate: effectiveDate || new Date(),
      notes,
      taxPercentage,
      insurancePercentage,
      grossSalary,
      netSalary,
      totalAllowances,
      totalDeductions,
      createdBy: req.user._id
    });

    const populatedSalary = await salary.populate([
      { path: 'employee', select: 'name email department position' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json(populatedSalary);
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update salary
const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure employee field is properly handled
    if (updateData.employee) {
      const employeeDoc = await User.findById(updateData.employee);
      if (!employeeDoc) {
        return res.status(404).json({ message: 'Employee not found' });
      }
    }

    const salary = await Salary.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'employee', select: 'name email department position' },
      { path: 'createdBy', select: 'name' }
    ]);

    if (!salary) {
      return res.status(404).json({ message: 'Salary not found' });
    }

    res.json(salary);
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete salary
const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findByIdAndDelete(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary not found' });
    }

    res.json({ message: 'Salary deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get salary history for employee
const getSalaryHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salaries = await Salary.find({ employee: employeeId })
      .populate('employee', 'name email department position')
      .populate('createdBy', 'name')
      .sort({ effectiveDate: -1 });

    res.json(salaries);
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get salary statistics
const getSalaryStats = async (req, res) => {
  try {
    const stats = await Salary.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          avgBasicSalary: { $avg: '$basicSalary' },
          minBasicSalary: { $min: '$basicSalary' },
          maxBasicSalary: { $max: '$basicSalary' },
          totalSalaryBudget: { $sum: '$basicSalary' }
        }
      }
    ]);

    const departmentStats = await Salary.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      { $unwind: '$employeeData' },
      {
        $group: {
          _id: '$employeeData.department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$basicSalary' },
          totalSalary: { $sum: '$basicSalary' }
        }
      },
      { $sort: { totalSalary: -1 } }
    ]);

    res.json({
      overall: stats[0] || {},
      byDepartment: departmentStats
    });
  } catch (error) {
    console.error('Error fetching salary stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllSalaries,
  getSalaryByEmployee,
  createSalary,
  updateSalary,
  deleteSalary,
  getSalaryHistory,
  getSalaryStats
}; 