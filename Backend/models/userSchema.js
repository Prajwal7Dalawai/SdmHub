const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "Full name is required"]
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  USN: {
    type: String,
    required: [true, "USN is required"],
    unique: true,
    match: [/^2SD\d{2}[A-Z]{2}\d{3}$/, "Please enter a valid USN in the format 2SDYYSSNNN"]
  },
  password_hash: String,
  role: {
    type: String,
    enum: ['student', 'faculty'],
    // required: [true, "Role must be specified"]
  },
  user_profile: {
    type: String,
    enum: ['Student', 'Alumni', 'Faculty'],
    // required: [true, "User profile must be specified"]
  },
  department: {
    type: String,
    enum: ["cse", "ise", "aiml", "ce", "me", "civil", "ece", "eee"],
    // required: true
  },
  graduation_year: {
    type: Number,
    // required: true
  },
  enrollment_year: {
    type: Number,
    // required: true
  },
  profile_pic: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    maxLength: [500, "Bio not more than 500 characters"]
  },
  profile_completion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  created_at: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema); 