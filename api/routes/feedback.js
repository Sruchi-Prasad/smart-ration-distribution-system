const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");

// POST feedback
router.post("/", async (req, res) => {
  try {
    const { shopId, userId, name, email, type, message } = req.body;

    if (!shopId || !message) {
      return res.status(400).json({ error: "Shop and message required" });
    }

    const feedback = new Feedback({
      user: userId || null,
      shop: shopId,
      name,
      email,
      type,
      message
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all feedback
// GET feedback for a specific shop
router.get("/shop/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    const feedbacks = await Feedback.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email"); // optional: show user info

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL FEEDBACK (ADMIN)
router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("shop", "shopName email") // show shop info
      .populate("user", "name email")     // show user info
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;