const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profilePicture: {type: String},
    contactNo: {type: String},
    department: {type: String},
    position: {type: String},
    date_of_joining: {type: Date, default: Date.now},
    status: {type: String, enum: ['active', 'inactive'], default: 'active'}
});

module.exports = mongoose.model('Employee', employeeSchema);
