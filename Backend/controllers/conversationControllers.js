const Conversation = require('../models/conversation.js');
const ConversationMember = require('../models/conversationMember.js');

const createConversation = async (req, res) => {
    try {
        const { type, title, creator_id, memberIds } = req.body;

        // Basic validation
        if (!type || !creator_id || !Array.isArray(memberIds) || memberIds.length < 2) {
            return res.status(400).json({ message: "Invalid data" });
        }

        // For DM → no title needed
        let convoData = { type, creator_id };
        if (type === "group") {
            if (!title) return res.status(400).json({ message: "Group must have a title" });
            convoData.title = title;
        }

        const convo = await Conversation.create(convoData);

        const members = memberIds.map(uid => ({
            conversation_id: convo._id,
            user_id: uid
        }));

        await ConversationMember.insertMany(members);

        return res.status(201).json(convo);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        const convos = await ConversationMember
            .find({ user_id: userId })
            .populate("conversation_id");

        return res.status(200).json(convos);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createConversation, getUserConversations };
