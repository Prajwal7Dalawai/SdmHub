
// MongoDB Schemas using Mongoose-like syntax

const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  author_id: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  image_urls: [String],
  created_at: Date,
  visibility: String
});

const commentSchema = new Schema({
  post_id: { type: Schema.Types.ObjectId, ref: 'Post' },
  author_id: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: Date
});

const likeSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  post_id: { type: Schema.Types.ObjectId, ref: 'Post' }
});

const groupSchema = new Schema({
  name: String,
  description: String,
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  expires_at: Date,
  status: String
});

const groupMemberSchema = new Schema({
  group_id: { type: Schema.Types.ObjectId, ref: 'Group' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});

const eventSchema = new Schema({
  title: String,
  description: String,
  organizer_id: { type: Schema.Types.ObjectId, ref: 'User' },
  event_date: Date,
  location: String,
  created_at: Date
});

const eventAttendeeSchema = new Schema({
  event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});

const messageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  is_read: Boolean,
  created_at: Date
});

// Export models
module.exports = {
  User: mongoose.model('User', userSchema),
  Post: mongoose.model('Post', postSchema),
  Comment: mongoose.model('Comment', commentSchema),
  Like: mongoose.model('Like', likeSchema),
  Group: mongoose.model('Group', groupSchema),
  GroupMember: mongoose.model('GroupMember', groupMemberSchema),
  Event: mongoose.model('Event', eventSchema),
  EventAttendee: mongoose.model('EventAttendee', eventAttendeeSchema),
  Message: mongoose.model('Message', messageSchema)
};
