const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Receiver
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered
  type: { 
    type: String, 
    enum: ["friend_request", "friend_accept", "like", "comment"], 
    required: true 
  },
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
