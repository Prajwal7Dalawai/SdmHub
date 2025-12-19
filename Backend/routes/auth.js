const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const passport = require('passport');
const { hashPassword, comparePassword } = require('../config/passport');
const { auth_docs_model } = require('../models/auth');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary config
const Post = require('../models/postSchema');
const controller = require('../controllers/authController');

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

        await newUser.save();

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
        profile_completion: user.profile_completion
    };

    const redirectPath = user.profile_completion < 100 ? '/editprofile' : '/dashboard';

    const token = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace with a strong secret from .env

    res.json({
        success: true,
        message: 'Logged in successfully',
        user: {
            id: user._id,
            first_name: user.first_name,
            email: user.email,
            USN: user.USN,
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
        if (!req.session?.user?.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const userId = req.session.user.id; // Use session user ID

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

router.post('/google', (req, res) => {
    controller.googleAuth(req, res);
});

router.post('/forgot-password', controller.forgotPassword);

router.post('/verify-otp', controller.verifyReset);

router.post('/reset-password', controller.resetPassword);


module.exports = router; 