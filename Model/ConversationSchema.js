const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Types.ObjectId, ref: 'user' }]
}, {
  timestamps: true
});

module.exports = mongoose.model("conversation", conversationSchema);