const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  postedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'},
  audience: { type: String, enum: ['all', 'employees', 'management'], default: 'all' }
});

module.exports = mongoose.model('Announcement', announcementSchema);
