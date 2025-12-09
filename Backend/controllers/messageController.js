const Message = require("../models/message.js");
const MessageCounter = require("../models/messageCounter.js");
const { getIO } = require("../socket");
const ConversationMember = require("../models/conversationMember.js");
const User = require("../models/userSchema.js");
const conversation = require("../models/conversation.js");
const mongoose = require('mongoose')


  async function sharedConversationEntity(req, recieverId){
    const user = req.user;
    console.log("User:", user);
    const receiverObjectId = new mongoose.Types.ObjectId(recieverId);
    const userObjectId = new mongoose.Types.ObjectId(user._id);
    console.log("IDs:", receiverObjectId, userObjectId);

    const sharedConversation = await ConversationMember.aggregate([
      {
        $match: {
          user_id: { $in: [userObjectId, receiverObjectId] }
        }
      },
      {
        $group: {
          _id: "$conversation_id",
          members: { $addToSet: "$user_id" }
        }
      },
      {
        $match: {
          members: { $size: 2 } // both users must be present
        }
      }
    ]);
    return sharedConversation;
}

const getChatList = async (req, res) => {
  try {
    const { userId } = req.params; // logged in user

    // 1) Find all conversations where user is a member
    const memberships = await ConversationMember.find({ user_id: userId });

    const conversationIds = memberships.map(m => m.conversation_id);

    // 2) Find all members from those conversations (excluding yourself)
    const otherMembers = await ConversationMember.find({
      conversation_id: { $in: conversationIds },
      user_id: { $ne: userId }
    }).populate("user_id");

    // 3) Extract pure users (unique)
    const users = [];
    const seen = new Set();

    for (const m of otherMembers) {
      if (!seen.has(m.user_id._id.toString())) {
        users.push({
  id: m.user_id._id,
  name: m.user_id.first_name,
  profile_pic: m.user_id.profile_pic
});
        seen.add(m.user_id._id.toString());
      }
    }

    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { recieverId, message } = req.body;
    const senderId = req.user._id;

    if (!recieverId || !message) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const sharedConversation = await sharedConversationEntity(req, recieverId);

    if (!sharedConversation.length) {
      return res.status(400).json({ message: "No shared conversation exists" });
    }

    const conversationId = sharedConversation[0]._id;

    const counter = await MessageCounter.findOneAndUpdate(
      { conversation_id: conversationId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Create raw message
    const msg = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: message,
      seq: counter.seq,
      type: "text",
    });

    // 🔥 Populate the message EXACTLY like fetchMessages()
    const populated = await Message.findById(msg._id)
      .populate("sender_id", "name username profile_pic")
      .lean();

    const io = getIO();

    // 🔥 Emit the populated version
    io.to(conversationId.toString()).emit("new_message", populated);

    // 🔥 Return the populated version
    return res.status(201).json(populated);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { recieverId } = req.params;
    const sharedConversation = await sharedConversationEntity(req, recieverId);

    if (!sharedConversation || sharedConversation.length === 0) {
      return res.status(200).json({
        conversation_id: null,
        messages: []
      });
    }

    const conversationId = sharedConversation[0]._id;

    const messages = await Message.find({ conversation_id: conversationId })
      .populate("sender_id", "name username")
      .sort({ seq: 1 });

    return res.status(200).json({
      conversation_id: conversationId,
      messages
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};


const deleteMessage = async (req, res)=>{
  try{
    const {msgId} = req.params;
  await Message.findByIdAndDelete(msgId);
  res.status(200).json({msg:`Message deleted of id ${msgId}`});
}catch(err){
  console.log(err);
  res.status(500).json({message: "Message deletion error"});
}
}


module.exports = { sendMessage, getMessages, getChatList, deleteMessage };
