const User = require('../models/User');
const mongoose = require('mongoose');

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid admin ID format.' });
    }

    const admin = await User.findById(id).select('-password');
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found.' });
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
    console.error('Error fetching admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get logged-in admin profile
const getMyProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    if (!admin || admin.role !== 'admin') {
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
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.contactNo = req.body.contactNo || admin.contactNo;

    await admin.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

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
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
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
