const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const passport = require('../config/passport');
const { auth_docs_model } = require('../models/auth');

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

        // Create new user
        const newUser = new User({
            first_name,
            email,
            USN,
            password_hash: password, // In production, use proper password hashing
            role,
            department,
            graduation_year,
            enrollment_year,
            bio,
            created_at: new Date()
        });

        await newUser.save();

        // Log in the user after successful signup
        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error during login after signup'
                });
            }
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: newUser._id,
                    first_name: newUser.first_name,
                    email: newUser.email,
                    USN: newUser.USN,
                    role: newUser.role
                }
            });
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
            role: req.user.role
        }
    });
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
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