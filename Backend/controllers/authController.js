const admin = require('../utils/firebase-admin.js');
const User = require('../models/userSchema');
const Otp = require('../models/verification.js');
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
        profile_completion: user.profile_completion,
        reset_password_otp: undefined,
        reset_password_expiry: undefined 
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
    try{
      const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    await Otp.deleteMany({ user_id: user._id });
    const otp = crypto.randomInt(100000,999999).toString();
    user.reset_password_otp = otp;
    user.reset_password_expiry = Date.now() + 10 * 60 * 1000; //10min
    await user.save();
    const verify = await Otp.create({
      otp,
      expiry: Date.now() + 10 * 60 * 1000,
      user_id: user._id
    });
    req.session.resetSession = {
      userId : verify.user_id,
      otp : verify.otp,
      expiry : verify.expiry
    }
    await sendEmail(email,"OTP for password Verification",`Password Reset OTP...\nYour One Time Password is: ${otp}\nYour otp expires in 10 minutes`);
    res.json({message: "OTP sent"});
  }catch(err){
    console.error("OTP Request error: ", err);
    return res.status(500).json({ message: "Server error" });
  }
}

const verifyReset = async (req,res) => {
    try{
      const {otp} = req.body;
      console.log("Session details:",req.session.resetSession)
    const verify = await Otp.findOne({user_id: req.session?.resetSession.userId});
    if(!verify || !verify.otp){
       return res.status(400).json({ message: "Invalid request, Request for OTP first" });
    }
    if(verify.otp != otp.toString().trim()){
      return res.status(401).json({message:"Incorrect OTP entered"});
    }
    if(verify.expiry < Date.now()){
      await Otp.deleteOne({ _id: verify._id });
      return res.status(410).json({message: "OTP has been expired, genarate new OTP"});
    }
    res.json({success: true, message: "OTP valid"});
  }catch(err){
    console.error("OTP Verification Error: ",err);
    return res.status(500).json({ message: "Server error" });
  }
}

const resetPassword = async (req, res) => {
    try {
      const { newPassword, confirmNewPassword } = req.body;

      if (!newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "Missing fields" });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "Passwords mismatch!" });
      }

      // ----------------- Validate session -----------------
      if (!req.session?.resetSession?.userId) {
        return res.status(403).json({
          message: "No reset session found. Request OTP again."
        });
      }

      // ----------------- Fetch user -----------------
      const user = await User.findById(req.session.resetSession.userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      // ----------------- Check if new = old -----------------
      const passwordAlreadySame = await bcrypt.compare(newPassword, user.password_hash);
      if (passwordAlreadySame) {
        return res.status(400).json({
          message: "Old and new passwords cannot be same"
        });
      }

      // ----------------- Validate OTP existence -----------------
      const verification = await Otp.findOne({ user_id: user._id });

      if (!verification) {
        return res.status(403).json({
          message:
            "OTP expired or already used. Restart reset process."
        });
      }
      await Otp.findByIdAndDelete(verification._id);
      // ----------------- Hash & Update Password -----------------
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashed;

      await user.save();

      // ----------------- Email user -----------------
      await sendEmail(
        user.email,
        "Password Reset Successful",
        `Hi ${user.first_name},
        Your password has been changed successfully.
        If this was not you, secure your account immediately.`
      );

      // ----------------- Kill reset session -----------------
      req.session.resetSession = null;

      return res.json({ message: "Password reset successful" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

module.exports = { googleAuth, forgotPassword, verifyReset, resetPassword };
