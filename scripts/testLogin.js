const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is not set');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check for existing users
    const users = await User.find({});
    console.log('Total users in database:', users.length);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
    });

    // Test specific users
    const adminUser = await User.findOne({ email: 'admin@hready.com' });
    const employeeUser = await User.findOne({ email: 'employee@hready.com' });
    
    console.log('\nAdmin user exists:', !!adminUser);
    console.log('Employee user exists:', !!employeeUser);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testLogin(); 