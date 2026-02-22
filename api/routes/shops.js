// routes/shops.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET all shopkeepers
router.get("/", async (req, res) => {
  try {
    // Only users with role 'shopkeeper' and shopName populated
    const shops = await User.find({ role: "shopkeeper" }, "_id shopName");

    res.json(shops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;