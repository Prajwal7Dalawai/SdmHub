const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["dm", "group"],
      required: true,
    },

    title: {
      type: String,
      required: function () {
        return this.type === "group";
      },
      default: null,
      trim: true,
    },

    conv_pic: {
      type: String,
      required: false, // 🔥 FIXED (optional)
      default: null,
    },

    // 🔥 ADMINS (multiple allowed)
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔥 CREATOR (single, immutable)
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "group";
      },
      immutable: true, // 🔥 VERY IMPORTANT
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
