// server/routes/admin.js
const express = require('express');
const User = require('../models/user');
const SwapRequest = require('../models/swap');
const authorizeAdmin = require('../middleware/adminAuth');

const router = express.Router();

// Admin: Get all users
router.get('/users', authorizeAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    const usersWithoutPasswords = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    res.json(usersWithoutPasswords);
  } catch (err) {
    console.error('Admin: Error fetching all users:', err.message);
    res.status(500).json({ message: 'Server error fetching all users' });
  }
});

// Admin: Toggle user active status (ban/unban)
router.put('/users/:id/active', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // boolean

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive must be a boolean' });
  }

  try {
    const updated = await User.updateIsActive(id, isActive);
    if (updated) {
      res.json({ message: `User status updated to ${isActive ? 'active' : 'banned'}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Admin: Error updating user active status:', err.message);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// Admin: Get all swap requests - FIXED to get all
router.get('/swaps', authorizeAdmin, async (req, res) => {
  try {
    // Pass null to findUserRequests to get all swaps
    const requests = await SwapRequest.findUserRequests(null);

    // For each request, fetch details of both fromUser and toUser
    const detailedRequests = await Promise.all(requests.map(async (request) => {
      const fromUser = await User.findById(request.fromUserId);
      const toUser = await User.findById(request.toUserId);

      return {
        ...request,
        fromUserName: fromUser ? fromUser.name : 'Unknown User',
        fromUserEmail: fromUser ? fromUser.email : 'N/A', // Added email
        fromUserProfilePhoto: fromUser ? fromUser.profilePhoto : 'https://placehold.co/32x32/cccccc/000000?text=U',
        fromUserSkillsOffered: fromUser ? fromUser.skillsOffered : [],
        fromUserSkillsWanted: fromUser ? fromUser.skillsWanted : [],
        fromUserRating: fromUser ? fromUser.rating : 0,

        toUserName: toUser ? toUser.name : 'Unknown User',
        toUserEmail: toUser ? toUser.email : 'N/A', // Added email
        toUserProfilePhoto: toUser ? toUser.profilePhoto : 'https://placehold.co/32x32/cccccc/000000?text=U',
        toUserSkillsOffered: toUser ? toUser.skillsOffered : [],
        toUserSkillsWanted: toUser ? toUser.skillsWanted : [],
        toUserRating: toUser ? toUser.rating : 0,
      };
    }));
    res.json(detailedRequests);
  } catch (err) {
    console.error('Admin: Error fetching all swap requests:', err.message);
    res.status(500).json({ message: 'Server error fetching all swap requests' });
  }
});

// Admin: Update any swap request status
router.put('/swaps/:id/status', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) { // Added 'completed'
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    const updated = await SwapRequest.updateStatus(id, status);
    if (updated) {
      res.json({ message: `Swap request status updated to ${status}` });
    } else {
      res.status(404).json({ message: 'Swap request not found' });
    }
  } catch (err) {
    console.error('Admin: Error updating swap request status:', err.message);
    res.status(500).json({ message: 'Server error updating swap request status' });
  }
});

// Admin: Delete any swap request - NEW
router.delete('/swaps/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await SwapRequest.delete(id);
    if (deleted) {
      res.json({ message: 'Swap request deleted successfully' });
    } else {
      res.status(404).json({ message: 'Swap request not found' });
    }
  } catch (err) {
    console.error('Admin: Error deleting swap request:', err.message);
    res.status(500).json({ message: 'Server error deleting swap request' });
  }
});


module.exports = router;

