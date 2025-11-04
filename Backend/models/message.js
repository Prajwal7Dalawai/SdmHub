const Message = require("../models/message");

const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, message } = req.body;

    if (!conversationId || !senderId || !message) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // get last message seq
    const lastMessage = await Message.findOne({ conversation_id: conversationId })
      .sort({ seq: -1 })
      .select("seq");

    const nextSeq = lastMessage ? lastMessage.seq + 1 : 1;

    const newMessage = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: message,
      seq: nextSeq,
      type: "text"
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendMessage };
