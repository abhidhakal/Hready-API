const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    housing: { type: Number, default: 0, min: 0 },
    transport: { type: Number, default: 0, min: 0 },
    meal: { type: Number, default: 0, min: 0 },
    medical: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    pension: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  overtime: {
    hours: { type: Number, default: 0, min: 0 },
    rate: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 }
  },
  bonuses: {
    performance: { type: Number, default: 0, min: 0 },
    attendance: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  leaves: {
    paid: { type: Number, default: 0, min: 0 },
    unpaid: { type: Number, default: 0, min: 0 },
    deduction: { type: Number, default: 0, min: 0 }
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'check', 'cash', 'digital_wallet'],
    default: 'bank_transfer'
  },
  transactionId: String,
  notes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for unique payroll per employee per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ status: 1, month: 1, year: 1 });

// Virtual for total allowances
payrollSchema.virtual('totalAllowances').get(function() {
  return Object.values(this.allowances).reduce((sum, val) => sum + val, 0);
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductions').get(function() {
  return Object.values(this.deductions).reduce((sum, val) => sum + val, 0);
});

// Virtual for total bonuses
payrollSchema.virtual('totalBonuses').get(function() {
  return Object.values(this.bonuses).reduce((sum, val) => sum + val, 0);
});

// Virtual for gross salary
payrollSchema.virtual('grossSalary').get(function() {
  return this.basicSalary + this.totalAllowances + this.overtime.amount + this.totalBonuses;
});

// Virtual for net salary
payrollSchema.virtual('netSalary').get(function() {
  return this.grossSalary - this.totalDeductions - this.leaves.deduction;
});

// Ensure virtuals are included in JSON
payrollSchema.set('toJSON', { virtuals: true });
payrollSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payroll', payrollSchema); 