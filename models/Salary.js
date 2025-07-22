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
    default: 'Rs.',
    enum: ['Rs.', 'USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
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
  taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
  insurancePercentage: { type: Number, default: 0, min: 0, max: 100 },
  grossSalary: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, default: 0, min: 0 },
  totalAllowances: { type: Number, default: 0, min: 0 },
  totalDeductions: { type: Number, default: 0, min: 0 },
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

// Remove virtuals for totalAllowances, totalDeductions, and netSalary
// since they now exist as real fields in the schema.

// Ensure virtuals are included in JSON
salarySchema.set('toJSON', { virtuals: true });
salarySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Salary', salarySchema); 