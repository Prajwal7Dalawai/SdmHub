const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const passport = require('passport');
const { hashPassword, comparePassword } = require('../config/passport');
const { auth_docs_model } = require('../models/auth');
const jwt = require('jsonwebtoken');

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
            user_profile
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
            user_profile
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        // Calculate new completion percentage
        const profileFields = {
            first_name: updateData.first_name ? 1 : 0,
            email: updateData.email ? 1 : 0,
            role: updateData.role ? 1 : 0,
            department: updateData.department ? 1 : 0,
            graduation_year: updateData.graduation_year ? 1 : 0,
            enrollment_year: updateData.enrollment_year ? 1 : 0,
            bio: updateData.bio ? 1 : 0,
            user_profile: updateData.user_profile ? 1 : 0
        };

        const completionPercentage = (Object.values(profileFields).reduce((a, b) => a + b, 0) / Object.keys(profileFields).length) * 100;
        updateData.profile_completion = completionPercentage;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        // Update session
        req.session.user = {
            ...req.session.user,
            ...updateData,
            profile_completion: completionPercentage
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                first_name: updatedUser.first_name,
                email: updatedUser.email,
                USN: updatedUser.USN,
                role: updatedUser.role,
                department: updatedUser.department,
                graduation_year: updatedUser.graduation_year,
                enrollment_year: updatedUser.enrollment_year,
                bio: updatedUser.bio,
                user_profile: updatedUser.user_profile,
                profile_completion: completionPercentage
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// Login route
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: req.user._id,
            first_name: req.user.first_name,
            email: req.user.email,
            USN: req.user.USN,
            role: req.user.role,
            profile_completion: req.user.profile_completion
        }
    });
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error during logout'
            });
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

module.exports = router; 