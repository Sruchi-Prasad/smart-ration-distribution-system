// api/models/Login.js
const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ipAddress: { type: String }, // optional
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Login", loginSchema);
