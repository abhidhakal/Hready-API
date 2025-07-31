const mongoose = require('mongoose');
const LoginAttempt = require('../models/LoginAttempt');
require('dotenv').config();

const checkLoginAttempts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check all login attempts
    const attempts = await LoginAttempt.find({}).sort({ timestamp: -1 });
    console.log('Total login attempts:', attempts.length);
    
    attempts.forEach((attempt, index) => {
      console.log(`${index + 1}. Email: ${attempt.email}, Success: ${attempt.success}, Time: ${attempt.timestamp}`);
    });
    
    // Check recent failed attempts for admin@hready.com
    const recentFailed = await LoginAttempt.find({
      email: 'admin@hready.com',
      success: false,
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });
    
    console.log('\nRecent failed attempts for admin@hready.com:', recentFailed.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkLoginAttempts(); 