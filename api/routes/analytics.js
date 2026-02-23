const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Feedback = require("../models/feedback");
const Product = require("../models/product");

// GET ADMIN ANALYTICS
router.get("/", async (req, res) => {
  try {
    // ---------- BASIC COUNTS ----------
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalShops = await User.countDocuments({ role: "shopkeeper" });
    const totalProducts = await Product.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    const totalComplaints = await Feedback.countDocuments({
      type: "Complaint",
    });

    // ---------- FEEDBACK TYPE STATS ----------
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // ---------- TOP COMPLAINT SHOPS ----------
    const topComplaintShops = await Feedback.aggregate([
      { $match: { type: "Complaint" } },
      {
        $group: {
          _id: "$shop",
          complaints: { $sum: 1 },
        },
      },
      { $sort: { complaints: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "shop",
        },
      },
      { $unwind: "$shop" },
      {
        $project: {
          shopName: "$shop.shopName",
          complaints: 1,
        },
      },
    ]);

    res.json({
      totals: {
        totalUsers,
        totalShops,
        totalProducts,
        totalFeedback,
        totalComplaints,
      },
      feedbackStats,
      topComplaintShops,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics error" });
  }
});

module.exports = router;