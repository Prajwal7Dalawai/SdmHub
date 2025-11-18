const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  author_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },

  caption: {
    type: String,
  },

  content_url: {
    type: String, // Cloudinary URL
  },

  content_public_id: {
    type: String, // Cloudinary public ID (delete/edit)
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  visibility: {
    type: String,
    enum: ['visible', 'archived'],
    default: 'visible'
  },

  // ------------------------------------------
  // Added Social Media Interaction Fields
  // ------------------------------------------
  like_count: {
    type: Number,
    default: 0
  },

  comment_count: {
    type: Number,
    default: 0
  },

  share_count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Post', PostSchema);
