const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userSchema'); // adjust path if needed

// ✅ Helper to get currently logged-in user's ID
function getUserId(req) {
  // Try Passport session → JWT user → frontend-sent userId
  return req.user?.id || req.session?.passport?.user || req.body?.userId || null;
}

// ----------------- POST /request/:id -----------------
// Send friend request
router.post('/request/:id', async (req, res) => {
  try {
    const senderId = getUserId(req);
    const receiverId = req.params.id;

    if (!senderId)
      return res.status(401).json({ msg: 'Unauthorized. Please log in.' });

    if (senderId === receiverId)
      return res.status(400).json({ msg: "You can't send request to yourself." });

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver)
      return res.status(404).json({ msg: 'User not found.' });

    // Already friends?
    if ((receiver.friendsList || []).some(f => String(f.friendId) === String(senderId)))
      return res.status(400).json({ msg: 'You are already friends.' });

    // Request already exists?
    if ((receiver.request || []).some(r => String(r.userId) === String(senderId)))
      return res.status(400).json({ msg: 'Request already sent.' });

    if ((sender.sentRequest || []).some(r => String(r.userId) === String(receiverId)))
      return res.status(400).json({ msg: 'Request already sent.' });

    // Add to receiver’s requests
    receiver.request = receiver.request || [];
    receiver.request.push({ username: sender.first_name, userId: sender._id });
    receiver.totalRequest = (receiver.totalRequest || 0) + 1;

    // Add to sender’s sent requests
    sender.sentRequest = sender.sentRequest || [];
    sender.sentRequest.push({ username: receiver.first_name, userId: receiver._id });

    await Promise.all([receiver.save(), sender.save()]);

    res.status(200).json({ message: 'Friend request sent!' });
  } catch (err) {
    console.error('Error sending request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- POST /accept/:id -----------------
router.post('/accept/:id', async (req, res) => {
  try {
    const receiverId = getUserId(req); // logged-in user
    const senderId = req.params.id;    // user who sent the request

    if (!receiverId)
      return res.status(401).json({ msg: "Unauthorized. Please log in." });

    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!receiver || !sender)
      return res.status(404).json({ msg: 'User not found.' });

    // Add each other as friends (avoid duplicates)
    receiver.friendsList = receiver.friendsList || [];
    sender.friendsList = sender.friendsList || [];

    if (!receiver.friendsList.some(f => String(f.friendId) === String(senderId))) {
      receiver.friendsList.push({ friendName: sender.first_name, friendId: sender._id });
    }

    if (!sender.friendsList.some(f => String(f.friendId) === String(receiverId))) {
      sender.friendsList.push({ friendName: receiver.first_name, friendId: receiver._id });
    }

    // Add followers/following (only push ObjectId, schema expects ObjectId)
    receiver.followers = receiver.followers || [];
    sender.following = sender.following || [];

    if (!receiver.followers.includes(sender._id)) {
      receiver.followers.push(sender._id);
    }

    if (!sender.following.includes(receiver._id)) {
      sender.following.push(receiver._id);
    }

    // Remove pending requests
    receiver.request = (receiver.request || []).filter(r => String(r.userId) !== String(senderId));
    sender.sentRequest = (sender.sentRequest || []).filter(r => String(r.userId) !== String(receiverId));
    receiver.totalRequest = Math.max(0, (receiver.totalRequest || 0) - 1);

    await Promise.all([receiver.save(), sender.save()]);

    res.status(200).json({ message: 'Friend request accepted!' });
  } catch (err) {
    console.error('Error accepting friend request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ----------------- POST /decline/:id -----------------
router.post('/decline/:id', async (req, res) => {
  try {
    const receiverId = getUserId(req);
    const senderId = req.params.id;

    if (!receiverId)
      return res.status(401).json({ msg: 'Unauthorized' });

    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!receiver || !sender)
      return res.status(404).json({ msg: 'User not found.' });

    receiver.request = (receiver.request || []).filter(r => String(r.userId) !== String(senderId));
    sender.sentRequest = (sender.sentRequest || []).filter(r => String(r.userId) !== String(receiverId));
    receiver.totalRequest = Math.max(0, (receiver.totalRequest || 0) - 1);

    await Promise.all([receiver.save(), sender.save()]);

    res.status(200).json({ message: 'Friend request declined!' });
  } catch (err) {
    console.error('Decline error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- GET /requests -----------------
router.get('/requests', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Unauthorized. Please log in.' });

    const user = await User.findById(userId)
      .populate('request.userId', 'first_name email profilePic')
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const formattedRequests = (user.request || []).map((r) => ({
      _id: r.userId?._id || null,
      name: r.userId?.first_name || r.username || 'Unknown',
      email: r.userId?.email || '',
      profilePic: r.userId?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      mutualFriends: r.mutualFriends || 0
    }));

    res.json(formattedRequests);
  } catch (err) {
    console.error('Error fetching friend requests:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- GET /sent -----------------
router.get('/sent', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const user = await User.findById(userId)
      .populate('sentRequest.userId', 'first_name email profilePic')
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const formatted = (user.sentRequest || []).map(s => ({
      _id: s.userId?._id || null,
      name: s.userId?.first_name || s.username,
      email: s.userId?.email || '',
      profilePic: s.userId?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching sent requests:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- GET /friends -----------------
router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    // Populate friendId
    const user = await User.findById(userId)
      .populate('friendsList.friendId', 'first_name profile_pic email')
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    // Map friends for frontend
    const friends = (user.friendsList || []).map(f => ({
      _id: f.friendId?._id || null,
      name: f.friendId?.first_name || f.friendName || 'Unknown',
      email: f.friendId?.email || '',
      profilePic: f.friendId?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }));

    res.json(friends);
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ----------------- GET /suggestions -----------------
router.get('/suggestions', async (req, res) => {
  try {
    const users = await User.find().limit(10).lean();
    const formatted = users.map(u => ({
      _id: u._id,
      name: u.first_name,
      profilePic: u.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      mutualFriends: 0
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
