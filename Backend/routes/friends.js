const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const passport = require('passport');
const { hashPassword, comparePassword } = require('../config/passport');
const { auth_docs_model } = require('../models/auth');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary config
const Post = require('../models/postSchema');

<<<<<<< HEAD
// Signup route
router.post('/signup', async (req, res) => {
    try {
        const {
            first_name,
            email,
            USN,
            password,
            role,
            department,
            graduation_year,
            enrollment_year,
            bio
        } = req.body;

        // First check if USN exists in auth_docs
        const authDoc = await auth_docs_model.findOne({ id: USN });
        if (!authDoc) {
            return res.status(400).json({
                success: false,
                message: 'ID not registered'
            });
        }
=======
// ✅ Helper to get currently logged-in user's ID
function getUserId(req) {
  // Try Passport session → JWT user → frontend-sent userId
  return (
    req.user?.id ||
    req.session?.passport?.user ||
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
>>>>>>> 6eb7c0c595a440b348a1fe6d94e042ae67924b4e

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email },
                { USN: USN }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or USN already exists'
            });
        }

        // Calculate profile completion percentage
        const profileFields = {
            first_name: first_name ? 1 : 0,
            email: email ? 1 : 0,
            USN: USN ? 1 : 0,
            role: role ? 1 : 0,
            department: department ? 1 : 0,
            graduation_year: graduation_year ? 1 : 0,
            enrollment_year: enrollment_year ? 1 : 0,
            bio: bio ? 1 : 0
        };

        const completionPercentage = (Object.values(profileFields).reduce((a, b) => a + b, 0) / Object.keys(profileFields).length) * 100;

<<<<<<< HEAD
        // Hash the password using bcrypt
        const hashedPassword = await hashPassword(password);

        // Create new user
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
            profile_completion: completionPercentage
        });
=======
    if ((receiver.friendsList || []).some(f => String(f.friendId) === String(senderId)))
      return res.status(400).json({ msg: 'You are already friends.' });

    if ((receiver.request || []).some(r => String(r.userId) === String(senderId)))
      return res.status(400).json({ msg: 'Request already sent.' });
>>>>>>> 6eb7c0c595a440b348a1fe6d94e042ae67924b4e

        await newUser.save();

<<<<<<< HEAD
        // Create session without passport login
        req.session.user = {
            id: newUser._id,
            first_name: newUser.first_name,
            email: newUser.email,
            USN: newUser.USN,
            role: newUser.role,
            profile_completion: completionPercentage
        };

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                email: newUser.email,
                USN: newUser.USN,
                role: newUser.role,
                profile_completion: completionPercentage
            },
            redirect: completionPercentage < 100 ? '/editprofile' : '/dashboard'
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during signup',
            error: error.message
        });
=======
    receiver.request = receiver.request || [];
    receiver.request.push({ username: sender.first_name, userId: sender._id });
    receiver.totalRequest = (receiver.totalRequest || 0) + 1;

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
>>>>>>> 6eb7c0c595a440b348a1fe6d94e042ae67924b4e
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

        console.log('Received edit profile request body:', req.body);

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

        // Remove undefined fields, but allow empty strings for profile fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // If a new profile picture is uploaded and old public ID exists, delete the old one from Cloudinary
        if (profile_pic_public_id && req.session.user.profile_pic_public_id && profile_pic_public_id !== req.session.user.profile_pic_public_id) {
            try {
                await cloudinary.uploader.destroy(req.session.user.profile_pic_public_id);
                console.log(`Old profile pic ${req.session.user.profile_pic_public_id} deleted from Cloudinary.`);
            } catch (deleteError) {
                console.error("Error deleting old Cloudinary image:", deleteError);
                // Continue even if old image deletion fails
            }
        }

        // Calculate new completion percentage based on all relevant fields
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

        // Update session with all updated profile data
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

<<<<<<< HEAD
// Login route
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login-failure',
    failureFlash: true
}), (req, res) => {
    const user = req.user;

    req.session.user = {
        id: user._id,
        first_name: user.first_name,
        email: user.email,
        USN: user.USN,
        role: user.role,
        profile_completion: user.profile_completion
    };

    const redirectPath = user.profile_completion < 100 ? '/editprofile' : '/dashboard';

    const token = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    }, 'your_jwt_secret', { expiresIn: '1h' }); // Replace with a strong secret from .env

    res.json({
        success: true,
        message: 'Logged in successfully',
        user: {
            id: user._id,
            first_name: user.first_name,
            email: user.email,
            USN: user.USN,
            role: user.role,
            profile_completion: user.profile_completion
        },
        token: token,
        redirect: redirectPath
    });
});

router.get('/login-failure', (req, res) => {
    res.status(401).json({ success: false, message: 'Authentication failed' });
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) { return next(err); }
            res.json({ success: true, message: 'Logged out successfully' });
        });
    });
});

// Get user profile route
router.get('/profile', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const userId = req.user._id; // Use req.user._id populated by Passport

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user: user.toObject(),
        });

    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message,
        });
    }
});

// Debug session route
router.get('/session-debug', (req, res) => {
    console.log('Session Debug: req.session =', req.session);
    console.log('Session Debug: req.user =', req.user);
    res.json({
        authenticated: req.isAuthenticated(),
        session: req.session,
        user: req.user ? req.user.toObject() : null, // Convert Mongoose object to plain object
        message: 'Session and user data for debugging'
    });
});

// Update only profile picture
router.post('/update-profile-pic', async (req, res) => {
    try {
        const userId = req.session.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { profile_pic, profile_pic_public_id } = req.body;
        if (!profile_pic || !profile_pic_public_id) {
            return res.status(400).json({ success: false, message: 'Missing image data' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profile_pic, profile_pic_public_id } },
            { new: true, runValidators: true }
        );
        req.session.user = { ...req.session.user, ...updatedUser.toObject() };
        res.json({ success: true, message: 'Profile picture updated', user: updatedUser });
    } catch (error) {
        console.error('Update profile pic error:', error);
        res.status(500).json({ success: false, message: 'Error updating profile picture', error: error.message });
    }
});

// Get profile stats: posts, followers, following
router.get('/profile-stats', async (req, res) => {
  try {
    const userId = req.session.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = await User.findById(userId).populate('followers').populate('following');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const posts = await Post.find({ author_id: userId }).sort({ created_at: -1 });
    res.json({
      success: true,
      posts: posts.map(post => ({ content_url: post.content_url, _id: post._id })),
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile stats', error: error.message });
  }
});

module.exports = router; 
=======
    receiver.followers = receiver.followers || [];
    sender.following = sender.following || [];

    if (!receiver.followers.includes(sender._id)) receiver.followers.push(sender._id);
    if (!sender.following.includes(receiver._id)) sender.following.push(receiver._id);

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
>>>>>>> 6eb7c0c595a440b348a1fe6d94e042ae67924b4e
