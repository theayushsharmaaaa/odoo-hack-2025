// server/routes/users.js
const express = require('express');
const User = require('../models/user');
const Feedback = require('../models/feedback'); // NEW: Feedback model
const authenticateToken = require('../middleware/auth'); // Import auth middleware
const authorizeAdmin = require('../middleware/adminAuth'); // NEW: Admin auth middleware

const router = express.Router();

// Get all public users (for browsing)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAllPublic();
    // Remove password before sending
    const usersWithoutPasswords = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    res.json(usersWithoutPasswords);
  } catch (err) {
    console.error('Error fetching public users:', err.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get all users (Admin only) - NEW
router.get('/all', authorizeAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    // Remove password before sending
    const usersWithoutPasswords = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    res.json(usersWithoutPasswords);
  } catch (err) {
    console.error('Error fetching all users (admin):', err.message);
    res.status(500).json({ message: 'Server error fetching all users' });
  }
});


// Get current user's profile (protected)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove password before sending
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update current user's profile (protected)
router.put('/me', authenticateToken, async (req, res) => {
  const { name, profilePhoto, location, skillsOffered, skillsWanted, availability, isPublic } = req.body;

  try {
    const updated = await User.update(req.user.id, {
      name,
      profilePhoto,
      location,
      skillsOffered,
      skillsWanted,
      availability,
      isPublic,
      isAdmin: req.user.isAdmin // Ensure isAdmin status is preserved
    });

    if (updated) {
      const user = await User.findById(req.user.id); // Fetch updated user
      const { password, ...userWithoutPassword } = user;
      res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
    } else {
      res.status(404).json({ message: 'User not found or no changes made' });
    }
  } catch (err) {
    console.error('Error updating user profile:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Submit feedback for a user (protected) - NEW
router.post('/:userId/feedback', authenticateToken, async (req, res) => {
  const { userId } = req.params; // The user receiving feedback
  const { swapRequestId, rating, comment } = req.body;
  const fromUserId = req.user.id; // The user giving feedback

  if (!swapRequestId || !rating || !userId) {
    return res.status(400).json({ message: 'Swap request ID, rating, and target user ID are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  if (fromUserId === userId) {
    return res.status(400).json({ message: 'Cannot give feedback to yourself' });
  }

  try {
    // Check if feedback already given for this swap by this user
    const existingFeedback = await Feedback.findByToUserId(userId); // Simplified check, ideally check by fromUser and swapRequestId
    const alreadyGiven = existingFeedback.some(f => f.swapRequestId === swapRequestId && f.fromUserId === fromUserId);

    if (alreadyGiven) {
      return res.status(409).json({ message: 'Feedback already submitted for this swap.' });
    }

    await Feedback.create({ swapRequestId, fromUserId, toUserId: userId, rating, comment });
    await User.updateRating(userId, rating); // Update the user's average rating

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('Error submitting feedback:', err.message);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
});


module.exports = router;

