const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Encrypted message payload
  ciphertext: { type: String, required: true },

  // Optional: Encrypted session key (if hybrid encryption is used)
  encrypted_session_key: { type: String },

  // Delivery/read receipts
  is_read: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false },

  // Timestamps
  created_at: { type: Date, default: Date.now },
  delivered_at: { type: Date },
  read_at: { type: Date }
});

// Export as a Mongoose model
module.exports = mongoose.model('Message', MessageSchema);