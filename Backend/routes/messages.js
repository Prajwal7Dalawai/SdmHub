const express = require('express');
const router = express.Router();
const Message = require('../models/messageSchema');

router.post('/',async (req,res)=>{
    try
    {const {sender_id, receiver_id, ciphertext, encrypted_session_key} = req.body;
    const msg = new Message({
        sender_id,
        receiver_id,
        ciphertext,
        encrypted_session_key
    });

    await msg.save();
    res.json({success: true, msg_ID: msg._id});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Failed to store message'});
    }
});

module.exports = router;