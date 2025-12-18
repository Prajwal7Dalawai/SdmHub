const admin = require('../utils/firebase-admin.js');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token required'
      });
    }

    // 🔐 Verify Google token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // (Optional) You can REMOVE this check safely
    if (decodedToken.firebase?.sign_in_provider !== 'google.com') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google auth provider'
      });
    }

    const {
  uid: google_uid,
  email,
  name,
  given_name,
  picture: profile_pic
} = decodedToken;

const first_name =
  given_name ||
  name ||
  email?.split('@')[0] ||
  'User';

    // 🔍 Find user by GOOGLE UID (correct)
    let user = await User.findOne({ email: email });

    // ---------------- SIGNUP FLOW ----------------
    if (!user) {
      user = await User.create({
        first_name,
        email,
        profile_pic,
        auth_provider: 'google',
        google_uid,
        profile_completion: 0,
        isNewUser: true
      });

      // ✅ Create session
      req.session.user = {
        id: user._id,
        first_name: user.first_name,
        email: user.email,
        USN: null,
        profile_completion: user.profile_completion
      };

      return res.status(201).json({
        success: true,
        message: 'Signed up successfully',
        user: {
          id: user._id,
          first_name: user.first_name,
          email: user.email,
          profile_completion: user.profile_completion
        },
        redirect: '/editprofile'
      });
    }

    // ---------------- LOGIN FLOW ----------------

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );


    req.session.user = {
      id: user._id,
      first_name: user.first_name,
      email: user.email,
      USN: user.USN || null,
      profile_completion: user.profile_completion
    };

    const redirectPath =
      user.profile_completion < 100 ? '/editprofile' : '/dashboard';

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        first_name: user.first_name,
        email: user.email,
        profile_completion: user.profile_completion
      },
      token,
      redirect: redirectPath
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Google token'
    });
  }
};

module.exports = { googleAuth };
