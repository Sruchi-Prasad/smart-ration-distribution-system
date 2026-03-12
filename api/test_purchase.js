const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");
const Product = require("./models/product");
const Purchase = require("./models/Purchase");

async function testPurchase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Find a user (any user)
        const user = await User.findOne({ role: "user" });
        if (!user) {
            console.log("❌ No user found to test with");
            return;
        }
        console.log(`👤 Testing with user: ${user.email} (${user._id})`);

        // 2. Find a product
        const product = await Product.findOne({ quantity: { $gt: 0 } });
        if (!product) {
            console.log("❌ No product with stock found");
            return;
        }
        console.log(`📦 Testing with product: ${product.name} (${product._id}), Stock: ${product.quantity}`);

        // 3. Simulate purchase logic
        const quantity = 1;
        console.log(`🛒 Attempting to buy ${quantity} unit(s)...`);

        const totalPrice = product.price * quantity;

        const purchase = new Purchase({
            user: user._id,
            productName: product.name,
            quantity: quantity,
            totalPrice: totalPrice,
            status: "Pending"
        });

        await purchase.save();
        console.log(`✅ Purchase record saved: ${purchase._id}`);

        product.quantity -= quantity;
        await product.save();
        console.log(`📉 Stock updated: ${product.quantity} remaining`);

        console.log("🎉 Test completed successfully!");

        // Cleanup
        await Purchase.findByIdAndDelete(purchase._id);
        product.quantity += quantity;
        await product.save();
        console.log("🧹 Cleanup done.");

        await mongoose.disconnect();
    } catch (err) {
        console.error("💥 Test failed with error:", err);
    }
}

testPurchase();
