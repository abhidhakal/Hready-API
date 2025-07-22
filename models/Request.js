const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['request', 'report'], default: 'request' },
  status: { type: String, enum: ['Pending', 'Resolved', 'Rejected'], default: 'Pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  adminComment: { type: String },
  attachment: { type: String }
});

module.exports = mongoose.model('Request', requestSchema); 