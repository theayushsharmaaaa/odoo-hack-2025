// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // User model

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePhoto: null,
      location: null,
      skillsOffered: [],
      skillsWanted: [],
      availability: 'Any',
      isPublic: true,
      isAdmin: false // Default to false for new registrations
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' }); // Include isAdmin in token

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isPublic: user.isPublic,
        isAdmin: user.isAdmin, // Include isAdmin
        rating: user.rating,
        reviews: user.reviews
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' }); // Include isAdmin in token

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isPublic: user.isPublic,
        isAdmin: user.isAdmin, // Include isAdmin
        rating: user.rating,
        reviews: user.reviews
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;

