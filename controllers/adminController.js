const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select('-password');
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({
      name: admin.name,
      email: admin.email,
      contactNo: admin.contactNo || '',
      profilePicture: admin.profilePicture || '',
      role: admin.role,
      lastPasswordChange: admin.updatedAt // Optional: show last update
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get logged-in admin profile
const getMyProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({
      name: admin.name,
      email: admin.email,
      contactNo: admin.contactNo || '',
      profilePicture: admin.profilePicture || '',
      role: admin.role,
      lastPasswordChange: admin.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update logged-in admin profile
const updateMyProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.contactNo = req.body.contactNo || admin.contactNo;
    // Note: profilePicture not updated here, handled separately

    await admin.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture (new)
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Save the base64 string
    admin.profilePicture = req.file.buffer.toString('base64');
    await admin.save();

    res.json({ message: 'Profile picture updated successfully' });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword; // Will be hashed by pre-save hook
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdminById,
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  changePassword,
  getAllUsers
};
