const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const recreateEmployee = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete existing employee user
    await User.deleteOne({ email: 'employee@hready.com' });
    console.log('Deleted existing employee user');

    // Create new employee user with fresh password hash
    const hashedPassword = await bcrypt.hash('EmployeePass123', 10);
    
    // Use updateOne to avoid the pre-save middleware
    await User.updateOne(
      { email: 'employee@hready.com' },
      {
        name: 'Test Employee',
        email: 'employee@hready.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        date_of_joining: new Date()
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    
    console.log('New employee user created successfully!');
    console.log('Email: employee@hready.com');
    console.log('Password: EmployeePass123');
    
    // Test the password
    const employeeUser = await User.findOne({ email: 'employee@hready.com' });
    const testMatch = await employeeUser.matchPassword('EmployeePass123');
    console.log('Password test result:', testMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

recreateEmployee(); 