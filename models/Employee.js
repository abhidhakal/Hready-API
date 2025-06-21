const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: {type: String},
    profilePicture: {type: String},
    contactNo: {type: String},
    role: {type: String, enum: ['employee'], default: 'employee'},
    department: {type: String},
    position: {type: String},
    date_of_joing: {type: Date, default: Date.now},
    status: {type: String, enum: ['active', 'inactive'], default: 'active'}
});

employeeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);