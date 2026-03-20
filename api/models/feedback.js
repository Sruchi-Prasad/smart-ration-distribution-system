const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional: the user giving feedback
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional: link to shopkeeper
  name: { type: String },   // optional name
  email: { type: String },  // optional email
  type: { type: String, enum: ["Suggestion", "Bug", "Complaint", "Other", "Card Problem", "Distribution Delay", "Wrong Quantity"], default: "Suggestion", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);