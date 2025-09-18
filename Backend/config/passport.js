const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');

// Helper function to hash password
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Helper function to compare password
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async function(email, password, done) {
        console.log('Attempting login for email:', email);
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                console.log('Login failed: User not found for email:', email);
                return done(null, false, { message: 'Incorrect email.' });
            }
            
            console.log('User found:', user.email);
            const isMatch = await comparePassword(password, user.password_hash);
            if (!isMatch) {
                console.log('Login failed: Incorrect password for email:', email);
                return done(null, false, { message: 'Incorrect password.' });
            }
            console.log('Login successful for user:', user.email);
            return done(null, user);
        } catch (err) {
            console.error('Passport LocalStrategy error:', err);
            return done(err);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = {
    hashPassword,
    comparePassword
}; 