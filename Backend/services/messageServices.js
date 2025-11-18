const Counter = require("../models/Counter");
const Message = require("../models/message");

async function createMessage(conversationId, senderId, text) {

  // 1) Increment the sequence atomically (Mongo is doing job here)
  const counter = await Counter.findOneAndUpdate(
    { conversationId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // 2) Create message with assigned seq
  const message = await Message.create({
    conversationId,
    senderId,
    message: text,
    seq: counter.seq,
  });

  return message;
}

module.exports = { createMessage };
