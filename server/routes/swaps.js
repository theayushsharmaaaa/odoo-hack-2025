// server/routes/swaps.js
const express = require('express');
const SwapRequest = require('../models/swap');
const User = require('../models/user'); // Needed to fetch user details for requests
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Create a new swap request (protected)
router.post('/', authenticateToken, async (req, res) => {
  const { toUserId, offeredSkill, wantedSkill, message } = req.body;
  const fromUserId = req.user.id; // Sender is the authenticated user

  if (!toUserId || !offeredSkill || !wantedSkill) { // Now require skills
    return res.status(400).json({ message: 'Recipient user ID, offered skill, and wanted skill are required' });
  }

  if (fromUserId === toUserId) {
    return res.status(400).json({ message: 'Cannot send a swap request to yourself' });
  }

  try {
    // Check if a pending or accepted swap already exists between these users (in either direction)
    const existingSwap = await SwapRequest.findExistingSwap(fromUserId, toUserId);
    if (existingSwap) {
      return res.status(409).json({ message: 'A pending or accepted swap request with this user already exists.' });
    }

    const swapRequest = await SwapRequest.create({ fromUserId, toUserId, offeredSkill, wantedSkill, message });
    res.status(201).json({ message: 'Swap request sent successfully', swapRequest });
  } catch (err) {
    console.error('Error creating swap request:', err.message);
    res.status(500).json({ message: 'Server error creating swap request' });
  }
});

// Get all swap requests for the authenticated user (incoming and outgoing)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await SwapRequest.findUserRequests(userId);

    // For each request, fetch details of both fromUser and toUser
    const detailedRequests = await Promise.all(requests.map(async (request) => {
      const fromUser = await User.findById(request.fromUserId);
      const toUser = await User.findById(request.toUserId);

      return {
        ...request,
        fromUserName: fromUser ? fromUser.name : 'Unknown User',
        fromUserProfilePhoto: fromUser ? fromUser.profilePhoto : 'https://placehold.co/32x32/cccccc/000000?text=U',
        fromUserSkillsOffered: fromUser ? fromUser.skillsOffered : [],
        fromUserSkillsWanted: fromUser ? fromUser.skillsWanted : [],
        fromUserRating: fromUser ? fromUser.rating : 0,

        toUserName: toUser ? toUser.name : 'Unknown User',
        toUserProfilePhoto: toUser ? toUser.profilePhoto : 'https://placehold.co/32x32/cccccc/000000?text=U',
        toUserSkillsOffered: toUser ? toUser.skillsOffered : [],
        toUserSkillsWanted: toUser ? toUser.skillsWanted : [],
        toUserRating: toUser ? toUser.rating : 0,
      };
    }));

    res.json(detailedRequests);
  } catch (err) {
    console.error('Error fetching user swap requests:', err.message);
    res.status(500).json({ message: 'Server error fetching swap requests' });
  }
});

// Update swap request status (protected)
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'
  const userId = req.user.id; // Authenticated user

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    const request = await SwapRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Only the recipient can accept/reject a pending request
    if (request.toUserId !== userId || request.status !== 'pending') {
      return res.status(403).json({ message: 'Not authorized to update this request status' });
    }

    const updated = await SwapRequest.updateStatus(id, status);
    if (updated) {
      res.json({ message: `Swap request ${status} successfully` });
    } else {
      res.status(500).json({ message: 'Failed to update swap request status' });
    }
  } catch (err) {
    console.error('Error updating swap request status:', err.message);
    res.status(500).json({ message: 'Server error updating swap request' });
  }
});

// Delete a swap request (protected) - NEW
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Authenticated user

  try {
    const request = await SwapRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Only the sender can delete a pending request
    if (request.fromUserId !== userId || request.status !== 'pending') {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    const deleted = await SwapRequest.delete(id);
    if (deleted) {
      res.json({ message: 'Swap request deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete swap request' });
    }
  } catch (err) {
    console.error('Error deleting swap request:', err.message);
    res.status(500).json({ message: 'Server error deleting swap request' });
  }
});


module.exports = router;

