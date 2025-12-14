const mongoose = require('mongoose')
const Conversation = require("../models/conversation.js");
const ConversationMember = require('../models/conversationMember.js');
const Message = require('../models/message.js');
const MessageCounter = require('../models/messageCounter.js');
const { getIO } = require("../socket");
async function createGrp(req, res) {
  try {
    let { title, members, convo_pic } = req.body;

    // ---------- Validation ----------
    if (!title || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Incomplete details",
      });
    }

    // ---------- Default group photo ----------
    if (!convo_pic || convo_pic.trim() === "") {
      convo_pic =
        "https://res.cloudinary.com/drvcis27v/image/upload/v1765713050/pexels-minan1398-1222949_yx8mfd.jpg";
    }

    // ---------- Normalize members ----------
    const creatorId = req.user._id.toString();

    const uniqueMembers = [
      ...new Set([...members.map(String), creatorId]),
    ];

    // ---------- Create conversation ----------
    const newGrp = await Conversation.create({
      type: "group",
      title: title.trim(),
      conv_pic: convo_pic,
      creator_id: req.user._id,
      admin: [req.user._id], // creator is admin
    });

    if (!newGrp) {
      return res.status(500).json({
        success: false,
        message: "Unable to create group",
      });
    }

    // ---------- Insert members separately ----------
    const memberDocs = uniqueMembers.map((userId) => ({
      conversation_id: newGrp._id,
      user_id: userId,
    }));

    await ConversationMember.insertMany(memberDocs);

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      conversationId: newGrp._id,
    });
  } catch (err) {
    console.error("Create group error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

const getGroupMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Verify membership
    const isMember = await ConversationMember.exists({
      conversation_id: conversationId,
      user_id: userId,
    });

    if (!isMember) {
      return res.status(403).json({ message: "Not a group member" });
    }

    // 2️⃣ Fetch messages
    const messages = await Message.find({
      conversation_id: conversationId,
    })
      .populate("sender_id", "first_name profile_pic")
      .sort({ seq: 1 });

    return res.json({
      conversation_id: conversationId,
      messages,
    });
  } catch (err) {
    console.error("getGroupMessages error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !message.trim()) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // Ensure conversation exists
    const convo = await Conversation.findOne({
      _id: conversationId,
      type: "group",
    });

    if (!convo) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Increment sequence
    const counter = await MessageCounter.findOneAndUpdate(
      { conversation_id: conversationId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Create message
    const msg = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: message,
      seq: counter.seq,
      type: "text",
    });

    const populated = await Message.findById(msg._id)
      .populate("sender_id", "first_name profile_pic")
      .lean();

    // Emit to group room
    const io = getIO();
    io.to(conversationId.toString()).emit("new_message", populated);

    return res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports = {createGrp, getGroupMessages, sendGroupMessage};