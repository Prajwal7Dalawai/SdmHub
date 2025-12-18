const mongoose = require('mongoose');

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
    // required: [true, "USN is required"],
    unique: true,
    match: [/^2SD\d{2}[A-Z]{2}\d{3}$/, "Please enter a valid USN in the format 2SDYYSSNNN"]
  },
    password_hash: {
      type: String,
      required: function () {
        return this.auth_provider === 'local';
      }
    },

  user_profile: {
    type: String,
    enum: ['Student', 'Alumni', 'Faculty']
  },
  department: {
    type: String,
    enum: ["cse", "ise", "aiml", "ce", "me", "civil", "ece", "eee"]
  },
  graduation_year: {
    type: Number
  },
  enrollment_year: {
    type: Number
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
    default: Date.now
  },

  // ----------- 🔗 Links -----------
  links: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },

  // ----------- 📚 Academic -----------
  cgpa: { type: String, default: '' },
  courses: { type: String, default: '' },
  certifications: { type: String, default: '' },
  skills: { type: String, default: '' },
  languages: { type: String, default: '' },
  careerInterests: { type: String, default: '' },
  projects: { type: String, default: '' },
  clubs: { type: String, default: '' },
  events: { type: String, default: '' },

  // ----------- 👥 Followers / Following -----------
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

  // ----------- 🧑‍🤝‍🧑 Friend System -----------
  sentRequest: [
    {
      username: { type: String, default: '' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  request: [
    {
      username: { type: String, default: '' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  friendsList: [
    {
      friendName: { type: String, default: '' },
      friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  totalRequest: {
    type: Number,
    default: 0
  },
  auth_provider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local'
},

google_uid: {
  type: String,
  unique: true,
  sparse: true
},

reset_password_otp:{
  type: String
},

reset_password_expiry: {
  type: Date
}
});

module.exports = mongoose.model('User', UserSchema);
