const mongoose = require('mongoose');
const { Schema } = mongoose;

const Like = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true });

module.exports = Like;
