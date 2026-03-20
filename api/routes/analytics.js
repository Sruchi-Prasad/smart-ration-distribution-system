const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Feedback = require("../models/feedback");
const Product = require("../models/product");
const Notification = require("../models/notification");
const Distribution = require("../models/distribution");
const { requireAuth } = require("../middleware/auth");

// GET ANALYTICS STATS (For Dashboard Charts)
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "user") {
      const entitlement = user.balance || { rice: 0, wheat: 0, sugar: 0, oil: 0 };
      const consumptionTrend = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          data: [
            Math.floor(entitlement.rice * 0.8) || 10,
            Math.floor(entitlement.rice * 0.9) || 12,
            Math.floor(entitlement.rice * 0.7) || 8,
            Math.floor(entitlement.rice * 1.0) || 15,
            Math.floor(entitlement.rice * 0.6) || 9,
            Math.floor(entitlement.rice * 0.9) || 11
          ]
        }]
      };

      const entitlementStats = [
        { name: "Rice", current: entitlement.rice || 0, total: 35, color: "#003366" },
        { name: "Wheat", current: entitlement.wheat || 0, total: 15, color: "#4CAF50" },
      ];

      // Calculate savings based on market vs ration price (approx 40 INR per kg diff)
      const totalSaved = (entitlement.rice + entitlement.wheat) * 40;

      res.json({
        type: "user",
        consumptionTrend,
        entitlementStats,
        summary: {
          totalSaved: `₹${totalSaved} estimated`,
          activeReminders: await Notification.countDocuments({ user: user._id, read: false }),
          nextDistribution: user.lastDistribution 
            ? new Date(new Date(user.lastDistribution).setMonth(new Date(user.lastDistribution).getMonth() + 1)).toLocaleDateString()
            : new Date().toLocaleDateString()
        }
      });
    } else if (user.role === "shopkeeper") {
      const stock = user.assignedStock || { rice: 0, wheat: 0, sugar: 0, oil: 0 };

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyDistCount = await Distribution.countDocuments({
        shopkeeper: req.user.sub,
        date: { $gte: startOfMonth }
      });

      res.json({
        type: "shopkeeper",
        stockStats: [
          { name: "Rice Stock", current: stock.rice || 0, total: 500, color: "#003366" },
          { name: "Wheat Stock", current: stock.wheat || 0, total: 300, color: "#4CAF50" },
          { name: "Sugar Stock", current: stock.sugar || 0, total: 100, color: "#FF9933" },
          { name: "Oil Stock", current: stock.oil || 0, total: 100, color: "#E91E63" }
        ],
        summary: {
          pendingKyc: await User.countDocuments({
            assignedShop: req.user.sub,
            $or: [
              { kycStatus: { $in: ["Pending", "Rejected"] } },
              { "memberDetails.kycStatus": { $in: ["Pending", "Rejected"] } }
            ]
          }),
          totalBeneficiaries: (await User.aggregate([
            { $match: { role: "user", assignedShop: user._id } },
            { $group: { _id: null, total: { $sum: "$members" } } }
          ]))[0]?.total || 0,
          monthlyDistributions: monthlyDistCount,
          nextDistributionDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()
        },
        distributionTrends: await Distribution.aggregate([
          {
            $match: {
              shopkeeper: req.user.sub,
              date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
            }
          },
          {
            $group: {
              _id: { $month: "$date" },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id": 1 } }
        ])
      });
    } else {
      res.json({ type: "admin", message: "Admin stats handled by /api/admin/panel" });
    }
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

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
      distributionTrends: await Distribution.aggregate([
        {
          $match: {
            date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) }
          }
        },
        {
          $group: {
            _id: { $month: "$date" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics error" });
  }
});

module.exports = router;