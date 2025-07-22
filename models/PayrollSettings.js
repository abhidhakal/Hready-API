const mongoose = require('mongoose');

const payrollSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('PayrollSettings', payrollSettingsSchema); 