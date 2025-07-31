const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const recreateAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@hready.com' });
    console.log('Deleted existing admin user');

    // Create new admin user with fresh password hash
    const hashedPassword = await bcrypt.hash('AdminPass123', 10);
    
    // Use updateOne to avoid the pre-save middleware
    await User.updateOne(
      { email: 'admin@hready.com' },
      {
        name: 'Admin User',
        email: 'admin@hready.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        date_of_joining: new Date()
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    
    console.log('New admin user created successfully!');
    console.log('Email: admin@hready.com');
    console.log('Password: AdminPass123');
    
    // Test the password
    const adminUser = await User.findOne({ email: 'admin@hready.com' });
    const testMatch = await adminUser.matchPassword('AdminPass123');
    console.log('Password test result:', testMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

recreateAdmin(); 