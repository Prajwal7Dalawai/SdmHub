const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },

  type: {
    type: String,
    enum: ["LIKE", "COMMENT", "FRIEND_REQUEST", "POST"],
    required: true
  },

  // For posts → postId, for friend requests → sender profile ID  
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  isRead: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
