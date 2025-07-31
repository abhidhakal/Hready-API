const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const testPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Test admin user password
    const adminUser = await User.findOne({ email: 'admin@hready.com' });
    if (adminUser) {
      console.log('Admin user found:', adminUser.email);
      console.log('Stored password hash:', adminUser.password);
      
      // Test password matching
      const testPassword = 'AdminPass123';
      const isMatch = await adminUser.matchPassword(testPassword);
      console.log('Password match result:', isMatch);
      
      // Test with bcrypt directly
      const directMatch = await bcrypt.compare(testPassword, adminUser.password);
      console.log('Direct bcrypt match:', directMatch);
      
      // Test creating a new hash
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash for same password:', newHash);
      console.log('New hash matches stored hash:', await bcrypt.compare(testPassword, newHash));
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testPassword(); 