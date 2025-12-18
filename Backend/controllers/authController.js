const admin = require('../utils/firebase-admin.js');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendEmail = require('../services/mail-service.js');
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

const forgotPassword = async (req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    const otp = crypto.randomInt(10000,99999).toString();
    user.reset_password_otp = otp;
    user.reset_password_expiry = Date.now() + 10 * 60 * 1000; //10min
    await user.save();
    await sendEmail(email,`Password Reset OTP...\nYour One Time Password is: ${otp}\nYour otp expires in 10 minutes`);
    res.json({message: "OTP sent"});
}

const verifyReset = async (req,res) => {
    const {email, otp} = req.body;
    const user = await User.findOne({email});
    if(!user || !user.reset_password_otp){
       return res.status(400).json({ message: "Invalid request" });
    }
    if(user.reset_password_otp != otp){
      return res.status(401).json({message:"Incorrect OTP entered"});
    }
    if(user.reset_password_expiry < Date.now()){
      return res.status(410).json({message: "OTP has been expired, genarate new OTP"});
    }
    res.json({success: true, message: "OTP valid"});
}

const resetPassword = async (req,res) => {
  const { email, oldPassword, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (oldPassword === newPassword)
    return res.json({ message: "old and new passwords cannot be same" });


  user.password = await bcrypt.hash(newPassword, 10);

  user.reset_password_otp = undefined;
  user.reset_password_expiry = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
}
module.exports = { googleAuth, forgotPassword, verifyReset, resetPassword };
