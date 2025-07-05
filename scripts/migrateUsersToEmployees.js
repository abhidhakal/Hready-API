require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({ role: 'employee' });

    for (const user of users) {
      const existingEmployee = await Employee.findOne({ userId: user._id });

      if (!existingEmployee) {
        await Employee.create({
          userId: user._id,
          department: '',
          position: '',
          status: 'active'
        });
        console.log(`Created Employee for user: ${user.email}`);
      }
    }

    console.log('Migration completed.');
    process.exit();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

run();
