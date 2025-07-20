const BankAccount = require('../models/BankAccount');
const User = require('../models/User');

// Get all bank accounts (admin only)
const getAllBankAccounts = async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find()
      .populate('employee', 'name email department position')
      .sort({ createdAt: -1 });

    res.json(bankAccounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bank accounts by employee ID
const getBankAccountsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const bankAccounts = await BankAccount.find({ 
      employee: employeeId,
      status: 'active'
    }).populate('employee', 'name email department position');

    res.json(bankAccounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create bank account
const createBankAccount = async (req, res) => {
  try {
    const {
      employeeId,
      bankName,
      accountNumber,
      accountHolderName,
      routingNumber,
      swiftCode,
      accountType,
      isDefault,
      notes
    } = req.body;

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // If this is set as default, unset other default accounts
    if (isDefault) {
      await BankAccount.updateMany(
        { employee: employeeId, isDefault: true },
        { isDefault: false }
      );
    }

    const bankAccount = await BankAccount.create({
      employee: employeeId,
      bankName,
      accountNumber,
      accountHolderName,
      routingNumber,
      swiftCode,
      accountType,
      isDefault: isDefault || false,
      notes
    });

    const populatedBankAccount = await bankAccount.populate(
      'employee', 'name email department position'
    );

    res.status(201).json(populatedBankAccount);
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bank account
const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If setting as default, unset other default accounts
    if (updateData.isDefault) {
      const bankAccount = await BankAccount.findById(id);
      if (bankAccount) {
        await BankAccount.updateMany(
          { employee: bankAccount.employee, isDefault: true },
          { isDefault: false }
        );
      }
    }

    const updatedBankAccount = await BankAccount.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('employee', 'name email department position');

    if (!updatedBankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json(updatedBankAccount);
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const bankAccount = await BankAccount.findByIdAndDelete(id);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set default bank account
const setDefaultBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const bankAccount = await BankAccount.findById(id);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Unset other default accounts for this employee
    await BankAccount.updateMany(
      { employee: bankAccount.employee, isDefault: true },
      { isDefault: false }
    );

    // Set this account as default
    bankAccount.isDefault = true;
    await bankAccount.save();

    const populatedBankAccount = await bankAccount.populate(
      'employee', 'name email department position'
    );

    res.json(populatedBankAccount);
  } catch (error) {
    console.error('Error setting default bank account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBankAccounts,
  getBankAccountsByEmployee,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
}; 