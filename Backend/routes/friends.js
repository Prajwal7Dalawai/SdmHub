const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const Notification = require("../models/notificationSchema");
const passport = require('passport');
const { hashPassword, comparePassword } = require('../config/passport');
const { auth_docs_model } = require('../models/auth');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const Post = require('../models/postSchema');

// ⭐ ADD THIS EXACTLY HERE
function getUserId(req) {
  return (
    req.user?.id ||
    req.session?.passport?.user ||
    req.session?.user?.id ||
    req.body?.userId ||
    req.query?.userId ||
    null
  );
}

// ----------------- POST /request/:id -----------------
router.post('/request/:id', async (req, res) => {
  try {
    const senderId = getUserId(req);
    const receiverId = req.params.id;

    if (!senderId)
      return res.status(401).json({ msg: 'Unauthorized. Please log in.' });

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver)
      return res.status(404).json({ msg: 'User not found.' });

    if ((receiver.friendsList || []).some(f => String(f.friendId) === String(senderId)))
      return res.status(400).json({ msg: 'You are already friends.' });

    if ((receiver.request || []).some(r => String(r.userId) === String(senderId)))
      return res.status(400).json({ msg: 'Request already sent.' });

    // ✅ Update Receiver → incoming request
    receiver.request = receiver.request || [];
    receiver.request.push({ 
      username: sender.first_name, 
      userId: sender._id 
    });

    receiver.totalRequest = (receiver.totalRequest || 0) + 1;

    // ✅ Update Sender → sent request
    sender.sentRequest = sender.sentRequest || [];
    sender.sentRequest.push({ 
      username: receiver.first_name, 
      userId: receiver._id 
    });

    await Promise.all([receiver.save(), sender.save()]);

    // 🔥 ADD NOTIFICATION HERE (NOW CONNECTED ✅)
    await Notification.create({
      sender_id: sender._id,
      receiver_id: receiver._id,
      message: `${sender.first_name} sent you a friend request`,
      type: "FRIEND_REQUEST",
      target_id: sender._id   // opens sender profile on click
    });

    res.status(200).json({ message: 'Friend request sent!' });

  } catch (err) {
    console.error('Error sending request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- POST /accept/:id -----------------
router.post('/accept/:id', async (req, res) => {
  try {
    const receiverId = getUserId(req);
    const senderId = req.params.id;

    if (!receiverId)
      return res.status(401).json({ msg: 'Unauthorized. Please log in.' });

    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!receiver || !sender)
      return res.status(404).json({ msg: 'User not found.' });

    receiver.friendsList = receiver.friendsList || [];
    sender.friendsList = sender.friendsList || [];

    if (!receiver.friendsList.some(f => String(f.friendId) === String(senderId))) {
      receiver.friendsList.push({ friendName: sender.first_name, friendId: sender._id });
    }

    if (!sender.friendsList.some(f => String(f.friendId) === String(receiverId))) {
      sender.friendsList.push({ friendName: receiver.first_name, friendId: receiver._id });
    }

    receiver.followers = receiver.followers || [];
    sender.following = sender.following || [];

    if (!receiver.followers.includes(sender._id)) receiver.followers.push(sender._id);
    if (!sender.following.includes(receiver._id)) sender.following.push(receiver._id);

    receiver.request = (receiver.request || []).filter(r => String(r.userId) !== String(senderId));
    sender.sentRequest = (sender.sentRequest || []).filter(r => String(r.userId) !== String(receiverId));
    receiver.totalRequest = Math.max(0, (receiver.totalRequest || 0) - 1);

    await Promise.all([receiver.save(), sender.save()]);

    // 🔥 SEND ACCEPTANCE NOTIFICATION
    await Notification.create({
      sender_id: receiver._id,
      receiver_id: sender._id,
      message: `${receiver.first_name} accepted your friend request`,
      type: "FRIEND_REQUEST",
      target_id: receiver._id
    });

    res.status(200).json({ message: 'Friend request accepted!' });
  } catch (err) {
    console.error('Error accepting friend request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



// Edit profile route
router.post('/editprofile', async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const {
            first_name,
            email,
            role,
            department,
            graduation_year,
            enrollment_year,
            bio,
            user_profile,
            cgpa,
            courses,
            certifications,
            skills,
            languages,
            careerInterests,
            projects,
            clubs,
            events,
            profile_pic,
            profile_pic_public_id,
            links
        } = req.body;

        // Validate user_profile
        const validProfiles = ['Student', 'Alumni', 'Faculty'];
        if (user_profile && !validProfiles.includes(user_profile)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user profile'
            });
        }

        // Validate department
        const validDepartments = ["cse", "ise", "aiml", "ce", "me", "civil", "ece", "eee"];
        if (department && !validDepartments.includes(department)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department'
            });
        }

        const updateData = {
            first_name,
            email,
            role,
            department,
            graduation_year,
            enrollment_year,
            bio,
            user_profile,
            cgpa,
            courses,
            certifications,
            skills,
            languages,
            careerInterests,
            projects,
            clubs,
            events,
            profile_pic,
            profile_pic_public_id,
            links
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // If a new profile picture is uploaded, delete the old one from Cloudinary
        if (profile_pic_public_id && req.session.user.profile_pic_public_id && profile_pic_public_id !== req.session.user.profile_pic_public_id) {
            try {
                await cloudinary.uploader.destroy(req.session.user.profile_pic_public_id);
                console.log(`Old profile pic deleted from Cloudinary.`);
            } catch (deleteError) {
                console.error("Error deleting old Cloudinary image:", deleteError);
            }
        }

        // Calculate profile completion percentage
        const userFields = await User.findById(userId);
        const currentProfile = { ...userFields._doc, ...updateData };

        const profileFieldsToConsider = {
            first_name: currentProfile.first_name,
            email: currentProfile.email,
            USN: currentProfile.USN,
            role: currentProfile.role,
            department: currentProfile.department,
            graduation_year: currentProfile.graduation_year,
            enrollment_year: currentProfile.enrollment_year,
            bio: currentProfile.bio,
            user_profile: currentProfile.user_profile,
            cgpa: currentProfile.cgpa,
            courses: currentProfile.courses,
            certifications: currentProfile.certifications,
            skills: currentProfile.skills,
            languages: currentProfile.languages,
            careerInterests: currentProfile.careerInterests,
            projects: currentProfile.projects,
            clubs: currentProfile.clubs,
            events: currentProfile.events,
            profile_pic: currentProfile.profile_pic,
            links_linkedin: currentProfile.links?.linkedin,
            links_github: currentProfile.links?.github,
            links_portfolio: currentProfile.links?.portfolio
        };

        const completedCount = Object.values(profileFieldsToConsider).filter(value => 
            value !== undefined && value !== null && value !== '' && 
            (Array.isArray(value) ? value.length > 0 : true)
        ).length;
        
        const totalFields = Object.keys(profileFieldsToConsider).length;
        const completionPercentage = (completedCount / totalFields) * 100;
        updateData.profile_completion = completionPercentage;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        req.session.user = {
            ...req.session.user,
            ...updatedUser.toObject()
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
            profile_completion: completionPercentage
        });

    } catch (error) {
        console.error('Edit profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

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
      .populate('request.userId', 'first_name email profile_pic friendsList')
      .populate('friendsList.friendId', 'friendsList')
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const userFriendIds = new Set(
      (user.friendsList || []).map(f => f.friendId?._id?.toString())
    );

    const formattedRequests = (user.request || []).map(r => {
      const reqUser = r.userId;
      if (!reqUser) return null;

      const reqFriendIds = new Set(
        (reqUser.friendsList || []).map(f => f.friendId?.toString())
      );

      // ✅ Find intersection
      const mutualCount = [...userFriendIds].filter(id => reqFriendIds.has(id)).length;

      return {
        _id: reqUser._id,
        name: reqUser.first_name || r.username || 'Unknown',
        email: reqUser.email || '',
        profilePic: reqUser.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        mutualFriends: mutualCount
      };
    }).filter(Boolean);

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
      .populate('sentRequest.userId', 'first_name email profile_pic')
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const formatted = (user.sentRequest || []).map(s => ({
      _id: s.userId?._id || null,
      name: s.userId?.first_name || s.username,
      email: s.userId?.email || '',
      profilePic: s.userId?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching sent requests:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- GET /friends -----------------
// ----------------- GET /friends (with mutual friends count) -----------------
router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    // Get current user + their friends
    const user = await User.findById(userId)
      .populate('friendsList.friendId', 'first_name profile_pic email friendsList')
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    const userFriendIds = new Set(
      (user.friendsList || []).map(f => f.friendId?._id?.toString())
    );

    // Calculate mutual friends count for each friend
    const friends = (user.friendsList || []).map(f => {
      const friend = f.friendId;
      if (!friend) return null;

      const theirFriendIds = new Set(
        (friend.friendsList || []).map(ff => ff.friendId?.toString())
      );

      // Intersection (mutual friends)
      const mutualCount = [...userFriendIds].filter(id => theirFriendIds.has(id)).length;

      return {
        _id: friend._id,
        name: friend.first_name || f.friendName || 'Unknown',
        email: friend.email || '',
        profilePic: friend.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        mutualFriends: mutualCount
      };
    }).filter(Boolean);

    // Sort by most mutual friends (optional)
    friends.sort((a, b) => b.mutualFriends - a.mutualFriends);

    res.json(friends);
  } catch (err) {
    console.error('Error fetching friends with mutual count:', err);
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
      profilePic: u.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      mutualFriends: 0
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
