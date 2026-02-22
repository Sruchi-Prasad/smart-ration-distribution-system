const express = require("express");
const router = express.Router();
const LoginModel = require("../models/Login"); // ✅ now exists

router.get("/recent-logins", async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const logins = await LoginModel.find({ createdAt: { $gte: since } });
    res.json(logins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logins" });
  }
});

module.exports = router;
