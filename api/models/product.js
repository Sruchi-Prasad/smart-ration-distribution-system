const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },             // optional, admin-only in routes
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String },
    minStock: { type: Number, default: 0 }, // optional, admin-only in routes
    role: { 
      type: String, 
      enum: ["admin", "shopkeeper"], 
      default: "admin" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);