const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
  },
  userAgent: String,
  attemptCount: {
    type: Number,
    default: 1
  }
});

// Index for efficient queries
loginAttemptSchema.index({ email: 1, timestamp: -1 });
loginAttemptSchema.index({ ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema); 