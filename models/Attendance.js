const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  check_in_time: {
    type: Date
  },
  check_out_time: {
    type: Date
  },
  total_hours: {
    type: Number
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'on leave'],
    default: 'present'
  },
  verification: {
    verified: { type: Boolean, default: false },
    method: { type: String, enum: ['qr'], default: 'qr' },
    verifiedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
