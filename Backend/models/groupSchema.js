const mongoose = require('mongoose');
const { Schema } = mongoose;

const Group = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' }
});

module.exports = Group;
