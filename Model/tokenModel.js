const mongoose = require("mongoose");
const user = require("./user");

const tokenSchema = new mongoose.Schema({
  token: { type: String },
  userId: { type: mongoose.Types.ObjectId, ref: 'user' },
}, {
  timestamps: true
});

module.exports = mongoose.model("token", tokenSchema);