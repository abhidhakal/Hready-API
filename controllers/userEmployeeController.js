const User = require('../models/User');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('name email department status profilePicture contactNo');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// Create employee (by admin)
const createEmployee = async (req, res) => {
  const {
    name,
    email,
    password,
    profilePicture,
    contactNo,
    department,
    position,
    status
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      profilePicture,
      contactNo,
      department,
      position,
      status
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get logged-in employee profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update logged-in employee profile
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.contactNo = req.body.contactNo || user.contactNo;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture (Multer-based)
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Cloudinary returns the URL in req.file.path
    const cloudinaryUrl = req.file.path;
    
    // Save the Cloudinary URL
    user.profilePicture = cloudinaryUrl;
    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: cloudinaryUrl
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update employee (by admin)
const updateEmployee = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated || updated.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete employee (by admin)
const deleteEmployee = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted || deleted.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getMyProfile,
  updateMyProfile,
  changePassword,
  uploadProfilePicture,
  updateEmployee,
  deleteEmployee
};
