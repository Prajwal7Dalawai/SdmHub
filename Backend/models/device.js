import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  deviceId: { type: String, required: true, unique: true },

  // Long-term identity key pair (private never leaves client)
  identityKeyPublic: { type: String, required: true },

  // Signed PreKey
  signedPreKeyId: { type: Number, required: true },
  signedPreKeyPublic: { type: String, required: true },
  signedPreKeySignature: { type: String, required: true },

  lastSeen: { type: Date, default: Date.now }
});

module.exports = {DeviceSchema}