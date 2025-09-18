const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "Full name is required"]
  },
  course: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
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
  password_hash: {
    type:String,
    required:true
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
    default: "https://res.cloudinary.com/drvcis27v/image/upload/v1750180422/default_rxs4pw.png"
  },
  profile_pic_public_id: {
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
  isNewUser: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
  },
  links: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  cgpa: { type: String, default: '' },
  courses: { type: String, default: '' },
  certifications: { type: String, default: '' },
  skills: { type: String, default: '' },
  languages: { type: String, default: '' },
  careerInterests: { type: String, default: '' },
  projects: { type: String, default: '' },
  clubs: { type: String, default: '' },
  events: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
});

module.exports = mongoose.model('User', UserSchema); 