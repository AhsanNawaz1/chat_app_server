const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Types.ObjectId },
  text: { type: String },
  senderId: { type: mongoose.Types.ObjectId, ref: 'user' }
}, {
  timestamps: true
});

module.exports = mongoose.model("message", messageSchema);