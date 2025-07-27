const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MongoDB connection failed: MONGO_URI environment variable is not set');
      console.error('Please set the MONGO_URI environment variable in your Render deployment settings');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
