const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            default: "Marketplace"
        },
        status: {
            type: String,
            enum: ["Completed", "Pending", "Cancelled"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
