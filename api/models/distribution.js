const mongoose = require("mongoose");

const distributionSchema = new mongoose.Schema({
  household: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Distribution", distributionSchema);
