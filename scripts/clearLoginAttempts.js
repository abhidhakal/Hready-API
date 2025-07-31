const mongoose = require('mongoose');
const LoginAttempt = require('../models/LoginAttempt');
require('dotenv').config();

const clearLoginAttempts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear all login attempts
    const result = await LoginAttempt.deleteMany({});
    console.log(`Cleared ${result.deletedCount} login attempts`);
    
    console.log('All accounts are now unlocked!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

clearLoginAttempts(); 