const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ message: 'User registered', userId: user._id });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role
    }
  });
};

const employeeLogin = async (req, res) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ email });
  if (!employee) return res.status(400).json({ message: 'Employee not found' });

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken({ _id: employee._id, role: 'employee' });

  res.status(200).json({
    token,
    user: {
      id: employee._id,
      name: employee.name,
      role: 'employee'
    }
  });
};

module.exports = { register, login, employeeLogin };
