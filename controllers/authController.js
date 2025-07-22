const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const bcrypt = require('bcryptjs');
const {
  validateEmail,
  validatePassword,
  sanitizeInput,
  getClientIP,
  isSuspiciousRequest
} = require('../utils/securityUtils');

// In-memory token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Clean up old tokens after 24 hours
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Check if account is locked
const isAccountLocked = async (email) => {
  const lockoutWindow = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  const recentAttempts = await LoginAttempt.find({
    email: email.toLowerCase(),
    success: false,
    timestamp: { $gte: new Date(Date.now() - lockoutWindow) }
  });

  return recentAttempts.length >= maxAttempts;
};

// Log login attempt
const logLoginAttempt = async (email, ipAddress, userAgent, success) => {
  try {
    await LoginAttempt.create({
      email: email.toLowerCase(),
      ipAddress,
      userAgent,
      success,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

// Audit logging
const logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, details);
};

const register = async (req, res) => {
  try {
    // Check for suspicious requests
    if (isSuspiciousRequest(req)) {
      logSecurityEvent('Suspicious registration attempt', {
        ip: getClientIP(req),
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, password, role } = req.body;

    // Validate and sanitize inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.error });
    }

    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (!role || !['admin', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: emailValidation.sanitized });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: emailValidation.sanitized,
      password: passwordValidation.sanitized,
      role
    });

    const token = generateToken(user);

    // Log successful registration
    logSecurityEvent('User registered', {
      email: emailValidation.sanitized,
      role,
      ip: getClientIP(req)
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    // Check for suspicious requests
    if (isSuspiciousRequest(req)) {
      logSecurityEvent('Suspicious login attempt', {
        ip: getClientIP(req),
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    const { email, password } = req.body;

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required' });
    }

    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent') || '';

    // Check if account is locked
    const isLocked = await isAccountLocked(emailValidation.sanitized);
    if (isLocked) {
      logSecurityEvent('Login attempt on locked account', {
        email: emailValidation.sanitized,
        ip: clientIP
      });
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed attempts. Please try again after 15 minutes.',
        retryAfter: 15 * 60
      });
    }

    // Find user
    const user = await User.findOne({ email: emailValidation.sanitized });
    if (!user) {
      await logLoginAttempt(emailValidation.sanitized, clientIP, userAgent, false);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logLoginAttempt(emailValidation.sanitized, clientIP, userAgent, false);
      
      // Check if account should be locked after this failed attempt
      const shouldLock = await isAccountLocked(emailValidation.sanitized);
      if (shouldLock) {
        logSecurityEvent('Account locked due to failed attempts', {
          email: emailValidation.sanitized,
          ip: clientIP
        });
        return res.status(423).json({ 
          message: 'Account locked due to too many failed attempts. Please try again after 15 minutes.',
          retryAfter: 15 * 60
        });
      }
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      await logLoginAttempt(emailValidation.sanitized, clientIP, userAgent, false);
      return res.status(401).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    // Generate token
    const token = generateToken(user);

    // Log successful login
    await logLoginAttempt(emailValidation.sanitized, clientIP, userAgent, true);
    
    logSecurityEvent('User logged in', {
      email: emailValidation.sanitized,
      role: user.role,
      ip: clientIP
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Add token to blacklist
      blacklistToken(token);
      logSecurityEvent('User logged out', {
        userId: req.user._id,
        ip: getClientIP(req)
      });
    }

    res.status(200).json({ 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Get login attempt statistics
const getLoginStats = async (req, res) => {
  try {
    const stats = await LoginAttempt.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $group: {
          _id: '$success',
          count: { $sum: 1 }
        }
      }
    ]);

    const successful = stats.find(s => s._id === true)?.count || 0;
    const failed = stats.find(s => s._id === false)?.count || 0;

    res.status(200).json({
      successful,
      failed,
      total: successful + failed
    });
  } catch (error) {
    console.error('Error getting login stats:', error);
    res.status(500).json({ message: 'Failed to get login statistics' });
  }
};

module.exports = { 
  register, 
  login, 
  logout, 
  isTokenBlacklisted,
  blacklistToken,
  getLoginStats
};
