const Message = require("../models/message.js");
const MessageCounter = require("../models/messageCounter.js");
const { getIO } = require("../socket");
const ConversationMember = require("../models/conversationMember.js");
const User = require("../models/userSchema.js");
const mongoose = require('mongoose')
const Conversation = require("../models/conversation.js");

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
    const userId = req.user._id;

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
    const { recieverId, message } = req.body;
    const senderId = req.user._id;
    const memberIds = [senderId, recieverId];

    if (!recieverId || !message) {
      return res.status(400).json({ message: "Invalid data" });
    }

    let sharedConversation = await sharedConversationEntity(req, recieverId);

    let conversationId;

    // If NO conversation exists → Create one
    if (!sharedConversation.length) {
      const convo = await Conversation.create({
        creator_id: senderId,
        type: "dm",
      });

      const members = memberIds.map((uid) => ({
        conversation_id: convo._id,
        user_id: uid,
      }));

      await ConversationMember.insertMany(members);

      // ⬅️ FIX: assign the new conversation
      conversationId = convo._id;
    } else {
      // existing conversation found
      conversationId = sharedConversation[0]._id;
    }

    // Now conversationId is ALWAYS valid

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

    const populated = await Message.findById(msg._id)
      .populate("sender_id", "name username profile_pic")
      .lean();

    const io = getIO();

    io.to(conversationId.toString()).emit("new_message", populated);

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




module.exports = { sendMessage, getMessages, getChatList, deleteMessage, searchPplAndGrps };
