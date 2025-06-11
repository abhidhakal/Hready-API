const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB(); // MongoDB connection

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
