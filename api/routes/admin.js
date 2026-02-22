const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { requireAuth, requireAdmin } = require("../middleware/auth");
// ✅ Always end with a handler function
router.get("/users/default", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ role: "user" }).sort({ createdAt: -1 });
    if (!user) return res.status(404).json({ error: "No user found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching default user:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
