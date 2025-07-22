const Payroll = require('../models/Payroll');
const Salary = require('../models/Salary');
const User = require('../models/User');

// Generate payroll for all employees for a specific month
const generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Get all active employees with salaries
    const employees = await User.find({ role: 'employee', status: 'active' });
    console.log(`Found ${employees.length} active employees`);
    
    const generatedPayrolls = [];
    const skippedEmployees = [];

    for (const employee of employees) {
      console.log(`Processing employee: ${employee.name} (${employee._id})`);
      
      // First try to find active salary
      let salary = await Salary.findOne({ 
        employee: employee._id, 
        status: 'active' 
      });

      // If no active salary, try to find any salary for this employee
      if (!salary) {
        console.log(`No active salary found for ${employee.name}, looking for any salary record`);
        salary = await Salary.findOne({ 
          employee: employee._id 
        }).sort({ createdAt: -1 }); // Get the most recent salary
      }

      if (!salary) {
        console.log(`Skipping ${employee.name} - no salary found at all`);
        skippedEmployees.push({ name: employee.name, reason: 'No salary found' });
        continue; // Skip employees without salary
      }

      console.log(`Found salary for ${employee.name}: ${salary.basicSalary} (status: ${salary.status})`);

      // Check if payroll already exists for this month
      const existingPayroll = await Payroll.findOne({
        employee: employee._id,
        month: parseInt(month),
        year: parseInt(year)
      });

      if (existingPayroll) {
        console.log(`Skipping ${employee.name} - payroll already exists for ${month}/${year}`);
        skippedEmployees.push({ name: employee.name, reason: `Payroll already exists for ${month}/${year}` });
        continue; // Skip if payroll already exists
      }

      // Create payroll record
      const payroll = await Payroll.create({
        employee: employee._id,
        month: parseInt(month),
        year: parseInt(year),
        basicSalary: salary.basicSalary,
        allowances: salary.allowances,
        deductions: salary.deductions,
        currency: salary.currency,
        createdBy: req.user._id
      });

      const populatedPayroll = await payroll.populate([
        { path: 'employee', select: 'name email department position' },
        { path: 'createdBy', select: 'name' }
      ]);

      console.log(`Generated payroll for ${employee.name}`);
      generatedPayrolls.push(populatedPayroll);
    }

    console.log(`Generated ${generatedPayrolls.length} payrolls, skipped ${skippedEmployees.length} employees`);
    console.log('Skipped employees:', skippedEmployees);

    res.status(201).json({
      message: `Generated ${generatedPayrolls.length} payroll records`,
      payrolls: generatedPayrolls,
      skippedEmployees
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all payrolls (admin only)
const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const filter = {};

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;

    const payrolls = await Payroll.find(filter)
      .populate('employee', 'name email department position')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payroll by ID
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate('employee', 'name email department position contactNo')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee's payroll history
const getEmployeePayrollHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const payrolls = await Payroll.find({ employee: employeeId })
      .populate('employee', 'name email department position')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ year: -1, month: -1 });

    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching employee payroll history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payroll
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payroll = await Payroll.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'employee', select: 'name email department position' },
      { path: 'createdBy', select: 'name' },
      { path: 'approvedBy', select: 'name' }
    ]);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve payroll
const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate([
      { path: 'employee', select: 'name email department position' },
      { path: 'createdBy', select: 'name' },
      { path: 'approvedBy', select: 'name' }
    ]);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Error approving payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark payroll as paid
const markPayrollAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, paymentMethod, transactionId } = req.body;

    const payroll = await Payroll.findByIdAndUpdate(
      id,
      {
        status: 'paid',
        paymentDate: paymentDate || new Date(),
        paymentMethod,
        transactionId
      },
      { new: true }
    ).populate([
      { path: 'employee', select: 'name email department position' },
      { path: 'createdBy', select: 'name' },
      { path: 'approvedBy', select: 'name' }
    ]);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Error marking payroll as paid:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk approve all draft payrolls for a given month and year
const bulkApprovePayrolls = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    const filter = { status: 'draft', month: parseInt(month), year: parseInt(year) };
    const result = await Payroll.updateMany(
      filter,
      {
        $set: {
          status: 'approved',
          approvedBy: req.user._id,
          approvedAt: new Date()
        }
      }
    );
    res.json({ message: `Approved ${result.modifiedCount} payrolls`, count: result.modifiedCount });
  } catch (error) {
    console.error('Error bulk approving payrolls:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payroll statistics
const getPayrollStats = async (req, res) => {
  try {
    const { year } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);

    const stats = await Payroll.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalPayrolls: { $sum: 1 },
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          avgGrossSalary: { $avg: '$grossSalary' },
          avgNetSalary: { $avg: '$netSalary' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    const statusStats = await Payroll.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netSalary' }
        }
      }
    ]);

    res.json({
      monthlyStats: stats,
      statusStats
    });
  } catch (error) {
    console.error('Error fetching payroll stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete payroll
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndDelete(id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  getEmployeePayrollHistory,
  updatePayroll,
  approvePayroll,
  markPayrollAsPaid,
  bulkApprovePayrolls,
  getPayrollStats,
  deletePayroll
}; 