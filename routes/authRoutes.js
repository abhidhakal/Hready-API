const express = require('express');
const { register, login, employeeLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/employee-login', employeeLogin);

module.exports = router;
