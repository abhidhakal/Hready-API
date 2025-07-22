const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    leaveType: {
      type: String,
      enum: ['Casual', 'Sick', 'Emergency', 'Annual', 'Other'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    halfDay: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      required: true
    },
    attachment: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    adminComment: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);