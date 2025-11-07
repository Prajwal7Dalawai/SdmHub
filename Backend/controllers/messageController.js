const Message = require("../models/message.js");
const MessageCounter = require("../models/messageCounter.js");
const {io} = require('../app.js');
const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, message } = req.body;

    if (!conversationId || !senderId || !message) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const counter = await MessageCounter.findOneAndUpdate(
      { conversation_id: conversationId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const msg = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: message,
      seq: counter.seq,
      type: "text",
    });

    // ✅ Send to all sockets joined in the conversation room
    io.to(conversationId).emit("new_message", msg);

    return res.status(201).json(msg);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};


const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const msgs = await Message.find({ conversation_id: conversationId }).sort({ seq: 1 });

    return res.status(200).json(msgs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};


module.exports = { sendMessage, getMessages };
