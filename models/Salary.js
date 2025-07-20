const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
salarySchema.index({ employee: 1, status: 1 });
salarySchema.index({ effectiveDate: -1 });

// Virtual for total salary
salarySchema.virtual('totalAllowances').get(function() {
  return Object.values(this.allowances).reduce((sum, val) => sum + val, 0);
});

salarySchema.virtual('totalDeductions').get(function() {
  return Object.values(this.deductions).reduce((sum, val) => sum + val, 0);
});

salarySchema.virtual('netSalary').get(function() {
  return this.basicSalary + this.totalAllowances - this.totalDeductions;
});

// Ensure virtuals are included in JSON
salarySchema.set('toJSON', { virtuals: true });
salarySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Salary', salarySchema); 