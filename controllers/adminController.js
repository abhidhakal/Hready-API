const User = require('../models/User');

const getAdminById = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminById };
