const Message = require('../models/message.js');

const sendMessage = async (req, res) => {
    try{
        const {conversationId, senderId, message} = req.body;
        const msg = await Message.create({conversationId, senderId, message});

        // later you'll emit socket event here
    // io.to(conversationId).emit("new_message", msg);

    res.status(201).json(msg);
    }
    catch(err){
        res.status(500).json({message: "server error"});
    }
}

const getMessages = async (req, res) => {
    try{
        const {conversationId} = req.params;
        const msgs = await Message.find({conversationId}).sort({createdAt : 1});
        res.status(200).json(msgs);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Server Error"});
    }
}

module.exports = {sendMessage, getMessages}