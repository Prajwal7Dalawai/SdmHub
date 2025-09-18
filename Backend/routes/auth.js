const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');
const { auth_docs_model } = require('../models/auth');
const cloudinary = require('../config/cloudinary');
const Post = require('../models/postSchema');

// Replace with .env secret keys
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_refresh_secret';

// 🔹 Helper: Generate tokens
function generateTokens(user, deviceId) {
  const payload = {
    userId: user._id,
    deviceId,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

// 🔹 Middleware: Verify access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload; // { userId, deviceId, role }
    next();
  });
}

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { first_name, email, USN, password, role, department, graduation_year, enrollment_year, bio, deviceId } = req.body;

    // Check if ID exists in auth_docs
    const authDoc = await auth_docs_model.findOne({ id: USN });
    if (!authDoc) return res.status(400).json({ success: false, message: 'ID not registered' });

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { USN }] });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name,
      email,
      USN,
      password_hash: hashedPassword,
      role,
      department,
      graduation_year,
      enrollment_year,
      bio,
      created_at: new Date(),
      profile_completion: 0, // compute later if needed
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser, deviceId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser._id, first_name, email, USN, role },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Error during signup', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { emailOrUSN, password, deviceId } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrUSN }, { USN: emailOrUSN }] });

    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user, deviceId);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: { id: user._id, first_name: user.first_name, email: user.email, USN: user.USN, role: user.role },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
});

// Refresh token route
router.post('/refresh-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_REFRESH_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);

    const { userId, deviceId, role } = payload;
    const accessToken = jwt.sign({ userId, deviceId, role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ accessToken });
  });
});

// Protected profile route
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

module.exports = router;
