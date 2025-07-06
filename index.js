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

// Import JWT middleware
const { protect, adminOnly } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(logger);

// Public route (Login/Register)
app.use('/api/auth', authRoutes);

// admin and employee route
app.use('/api/admins', adminRoutes);
app.use('/api/employees', employeeRoutes)

// announcements route
app.use('/api/announcements', announcementRoutes);

// attendance route
app.use('/api/attendance', attendanceRoutes);

// Example protected admin route
app.get('/api/admin/dashboard', protect, adminOnly, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  res.json({
    message: 'Welcome Admin!',
    user: req.user
  });
});

app.get('/api/employee/dashboard', protect, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied: Employees only' });
  }

  res.json({
    message: 'Welcome Employee!',
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
