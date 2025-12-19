const mongoose = require("mongoose");

const MessageCounterSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    unique: true, // one counter per conversation
  },
  seq: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("MessageCounter", MessageCounterSchema);
