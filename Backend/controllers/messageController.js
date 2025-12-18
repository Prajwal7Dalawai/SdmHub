const Message = require("../models/message.js");
const MessageCounter = require("../models/messageCounter.js");
const { getIO } = require("../socket");
const ConversationMember = require("../models/conversationMember.js");
const User = require("../models/userSchema.js");
const mongoose = require('mongoose')
const Conversation = require("../models/conversation.js");
const message = require("../models/message.js");

const getChatList = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const memberships = await ConversationMember.find({ user_id: userId });
    const conversationIds = memberships.map(m => m.conversation_id);

    const conversations = await Conversation.find({
      _id: { $in: conversationIds }
    }).lean();

    const chatList = [];

    for (const convo of conversations) {
      if (convo.type === "dm") {
        const otherMember = await ConversationMember.findOne({
          conversation_id: convo._id,
          user_id: { $ne: userId }
        }).populate("user_id");

        if (!otherMember?.user_id) continue;

        chatList.push({
          id: otherMember.user_id._id,     // ✅ USER ID
          conversationId: convo._id,       // ✅ DM CONVERSATION ID
          type: "dm",
          name: otherMember.user_id.first_name,
          profile_pic: otherMember.user_id.profile_pic,
        });
      } else {
        chatList.push({
          id: convo._id,                   // ✅ GROUP ID
          conversationId: convo._id,       // ✅ GROUP CONVERSATION ID
          type: "group",
          name: convo.title,
          profile_pic: convo.conv_pic,
        });
      }
    }

    res.json(chatList);
  } catch (err) {
    console.error("getChatList error:", err);
    res.status(500).json({ message: "server error" });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const senderId = req.session.user.id;

    if (!conversationId || !message.trim()) {
      return res.status(400).json({ message: "Invalid data" });
    }

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    // Validate membership
    const membership = await ConversationMember.findOne({
      conversation_id: conversationId,
      user_id: senderId
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this conversation."
      });
    }

    // Create seq counter
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
    });

    const populated = await Message.findById(msg._id)
      .populate("sender_id", "first_name profile_pic")
      .lean();

    const io = getIO();

    io.to(conversationId).emit("new_message", populated);

    return res.status(201).json(populated);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "server error" });
  }
};

const startDirectChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid otherUserId" });
    }

    if (userId === otherUserId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check for existing conversation
    const existing = await ConversationMember.aggregate([
      {
        $match: {
          user_id: { $in: [userId, otherUserId] }
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
          members: { $size: 2 }
        }
      }
    ]);

    // If exists → return it
    if (existing.length > 0) {
      return res.status(200).json({
        conversationId: existing[0]._id.toString(),
      });
    }

    // Create conversation
    const convo = await Conversation.create({
      type: "dm"
    });

    await ConversationMember.insertMany([
      { conversation_id: convo._id, user_id: userId },
      { conversation_id: convo._id, user_id: otherUserId }
    ]);

    return res.status(201).json({
      conversationId: convo._id.toString()
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
};


const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Validate ID
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    // Validate membership
    const membership = await ConversationMember.findOne({
      conversation_id: conversationId,
      user_id: userId
    });

    if (!membership) {
      return res.status(403).json({
        message: "Access denied. Not a member of this conversation."
      });
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .populate("sender_id", "first_name")
      .sort({ createdAt: 1 });

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

const searchPplAndGrps = async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query.trim()) return res.json([]);

    /* ---------------- USERS ---------------- */
    const users = await User.find({
      $or: [
        { first_name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    })
      .limit(10)
      .lean();

    const formattedUsers = users.map(user => ({
      id: user._id,
      type: "DM",
      name: user.first_name,
      email: user.email,
      profilePic:
        user.profile_pic ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      mutualFriends: 0
    }));

    /* ---------------- GROUPS ---------------- */
    const groups = await Conversation.find({
      type: "group",
      title: { $regex: query, $options: "i" }
    })
      .limit(10)
      .lean();

    const formattedGroups = groups.map(group => ({
      id: group._id,
      type: "group",
      name: group.title,
      profilePic:
        group.conv_pic ||
        "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      membersCount: group.members?.length || 0
    }));

    /* ---------------- MERGE ---------------- */
    const results = [...formattedUsers, ...formattedGroups];

    return res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};




module.exports = { sendMessage, getMessages, getChatList, deleteMessage, searchPplAndGrps, startDirectChat };
