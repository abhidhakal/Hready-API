const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./middleware/logger');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const requestRoutes = require('./routes/requestRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');

const { protect, adminOnly } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
// const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(logger);

// Public route (Login/Register)
app.use('/api/auth', authRoutes);

// Admin and employee routes
app.use('/api/admins', adminRoutes);
app.use('/api/employees', employeeRoutes);

// Announcements route
app.use('/api/announcements', announcementRoutes);

// Attendance route
app.use('/api/attendance', attendanceRoutes);

// Task route
app.use('/api/tasks', taskRoutes);

// Leaves route
app.use('/api/leaves', leaveRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/requests', requestRoutes);

// Payroll routes
app.use('/api/salaries', salaryRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);

// Example protected admin dashboard
app.get('/api/admin/dashboard', protect, adminOnly, (req, res) => {
  res.json({
    message: 'Welcome Admin!',
    user: req.user
  });
});

// Example protected employee dashboard
app.get('/api/employee/dashboard', protect, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied: Employees only' });
  }

  res.json({
    message: 'Welcome Employee!',
    user: req.user
  });
});

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

module.exports = app;
