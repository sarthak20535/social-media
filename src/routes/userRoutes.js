const express = require('express');
const { signup, login, getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// User signup
router.post('/signup', signup);

// User login
router.post('/login', login);

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, updateProfile);

module.exports = router;
