const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();          // Load .env
connectDB();              // Connect to MongoDB

const app = express();
app.use(express.json());  // To parse JSON body

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

