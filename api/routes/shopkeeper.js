const express = require("express");
const router = express.Router();
const { authenticate, requireShopkeeper } = require("../middleware/auth");
const User = require("../models/user");
const { requireAuth } = require("../middleware/auth"); // ✅ destructure the function you need

// 🔹 GET /api/shopkeeper/users → only users
// Example route in routes/shopkeeper.js
router.get("/users", requireAuth, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("fullName email phone city members memberDetails lastLogin");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 🔹 GET /api/shopkeeper/incomplete-kyc → only users with pending KYC
router.get("/incomplete-kyc", authenticate, requireShopkeeper, async (req, res) => {
  try {
    const households = await User.find({
      role: "user",
      kycStatus: { $ne: "Verified" }
    });
    res.json(households);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
