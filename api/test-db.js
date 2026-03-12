require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Product = require("./models/product");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-ration-distribution-system").then(async () => {

    // Simulate what the API routes actually do
    const apiUsers = await User.find({ role: "user" }).select("fullName email phone city members memberDetails lastLogin");
    const apiProducts = await Product.find().sort({ createdAt: -1 });

    console.log("=== USERS FROM API QUERY ===");
    console.log(apiUsers.slice(0, 2)); // Print max 2
    console.log("Count:", apiUsers.length);

    console.log("\n=== PRODUCTS FROM API QUERY ===");
    console.log(apiProducts.slice(0, 2));
    console.log("Count:", apiProducts.length);

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
