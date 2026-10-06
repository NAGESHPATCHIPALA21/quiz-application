const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user (creator or participant)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if user exists
    const existingEmail = await UserRepository.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingUsername = await UserRepository.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'This username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await UserRepository.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role === 'creator' ? 'creator' : 'participant'
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        stats: newUser.stats
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials.' });
    }

    // Search by email or username
    let user = await UserRepository.findOne({ email: emailOrUsername });
    if (!user) {
      user = await UserRepository.findOne({ username: emailOrUsername });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user info
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
