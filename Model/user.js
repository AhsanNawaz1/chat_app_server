const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  access_token: { type: String },
  otpSent: { type: String },
  imgUrl: { type: String },
  isVerified: { type: Boolean }
}, {
  timestamps: true
});

module.exports = mongoose.model("user", userSchema);