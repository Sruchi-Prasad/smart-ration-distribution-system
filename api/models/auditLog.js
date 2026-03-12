const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. "Added Product", "Deleted User"
  user: { type: String, required: true },   // who performed the action
  details: { type: String },                // optional extra info
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);