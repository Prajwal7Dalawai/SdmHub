const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seq: {
      type: Number,
      required: true, // will be assigned when creating messages
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "attachment", "system"],
      default: "text",
    },

    content: {
      type: String,
      default: null,
    },

    reply_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment", // we will add that model later when needed
      },
    ],

    edited_at: {
      type: Date,
      default: null,
    },

    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversation_id: 1, seq: 1 });
module.exports = mongoose.model("Message", MessageSchema);
