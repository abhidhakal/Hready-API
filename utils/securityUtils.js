const crypto = require('crypto');
const validator = require('validator');

/**
 * Sanitize and validate email
 * @param {string} email 
 * @returns {object} { isValid: boolean, sanitized: string, error: string }
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '', error: 'Email is required' };
  }

  const sanitized = validator.trim(email.toLowerCase());
  
  if (!validator.isEmail(sanitized)) {
    return { isValid: false, sanitized: '', error: 'Invalid email format' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, sanitized: '', error: 'Email too long' };
  }

  return { isValid: true, sanitized, error: null };
};

/**
 * Validate password strength
 * @param {string} password 
 * @returns {object} { isValid: boolean, error: string }
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password too long' };
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^123456/,
    /^password/,
    /^qwerty/,
    /^admin/,
    /^123456789/,
    /^111111/,
    /^000000/
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password.toLowerCase())) {
      return { isValid: false, error: 'Password is too weak' };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Sanitize input string
 * @param {string} input 
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  return validator.escape(validator.trim(input));
};

/**
 * Generate secure random string
 * @param {number} length 
 * @returns {string}
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash sensitive data
 * @param {string} data 
 * @returns {string}
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Get client IP address
 * @param {object} req 
 * @returns {string}
 */
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket?.remoteAddress || 
         'unknown';
};

/**
 * Validate user agent
 * @param {string} userAgent 
 * @returns {boolean}
 */
const isValidUserAgent = (userAgent) => {
  if (!userAgent || typeof userAgent !== 'string') return false;
  
  // Check for suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) return false;
  }

  return userAgent.length > 10 && userAgent.length < 500;
};

/**
 * Check if request is from a suspicious source
 * @param {object} req 
 * @returns {boolean}
 */
const isSuspiciousRequest = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  const origin = req.get('Origin') || '';

  // Check for missing or suspicious headers
  if (!isValidUserAgent(userAgent)) return true;
  
  // Check for suspicious referer patterns
  if (referer && !referer.includes(req.get('Host'))) {
    const suspiciousReferers = ['data:', 'javascript:', 'vbscript:'];
    for (const suspicious of suspiciousReferers) {
      if (referer.startsWith(suspicious)) return true;
    }
  }

  return false;
};

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  generateSecureToken,
  hashData,
  getClientIP,
  isValidUserAgent,
  isSuspiciousRequest
}; 