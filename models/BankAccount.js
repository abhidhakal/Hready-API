const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  routingNumber: {
    type: String,
    trim: true
  },
  swiftCode: {
    type: String,
    trim: true
  },
  accountType: {
    type: String,
    enum: ['savings', 'checking', 'current'],
    default: 'checking'
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient queries
bankAccountSchema.index({ employee: 1, isDefault: 1 });
bankAccountSchema.index({ employee: 1, status: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema); 