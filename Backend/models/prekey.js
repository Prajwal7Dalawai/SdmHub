import mongoose from "mongoose";

const PreKeySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },

  preKeyId: { type: Number, required: true },
  preKeyPublic: { type: String, required: true },

  // whether it has been used already
  used: { type: Boolean, default: false },

  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model("PreKey", PreKeySchema);
