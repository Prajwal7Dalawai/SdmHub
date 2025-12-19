const mongoose = require('mongoose');

const Verification = new mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    expiry:{
        type: Date,
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Otp',Verification);