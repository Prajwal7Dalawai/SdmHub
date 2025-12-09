const mongoose = require("mongoose");

const ConversationMemberSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
    last_read_seq: {
      type: Number,
      default: 0, // used later when we add real read receipts
    },
  },
  { timestamps: true }
);

ConversationMemberSchema.index({ conversation_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ConversationMember", ConversationMemberSchema);
