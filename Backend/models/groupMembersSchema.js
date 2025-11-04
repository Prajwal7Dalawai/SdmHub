const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupMember = new Schema({
  group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = GroupMember;
