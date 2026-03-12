const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { requireAuth, requireAdmin } = require("../middleware/auth");
// ✅ Always end with a handler function
router.get("/users/default", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ role: "user" }).sort({ createdAt: -1 }).populate("assignedShop", "fullName shopName");
    if (!user) return res.status(404).json({ error: "No user found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching default user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ ASSIGN SHOP TO USER
router.post("/users/:id/assignShop", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { shopId } = req.body;

    // We use findByIdAndUpdate to only update 'assignedShop' and bypass strict document validation 
    // for older records that might be missing newly required fields (like dateOfBirth).
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id, role: "user" },
      { assignedShop: shopId || null },
      { new: true, runValidators: false }
    ).populate("assignedShop", "fullName shopName");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Shop assigned successfully", user: updatedUser });
  } catch (err) {
    console.error("Error assigning shop:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ ASSIGN STOCK TO SHOPKEEPER
router.post("/assign-stock", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { shopkeeperId, rice, wheat, sugar, oil } = req.body;

    const shopkeeper = await User.findOneAndUpdate(
      { _id: shopkeeperId, role: "shopkeeper" },
      {
        $inc: {
          "assignedStock.rice": Number(rice) || 0,
          "assignedStock.wheat": Number(wheat) || 0,
          "assignedStock.sugar": Number(sugar) || 0,
          "assignedStock.oil": Number(oil) || 0
        }
      },
      { new: true, runValidators: false }
    );

    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });

    res.json({ message: "Stock assigned successfully", assignedStock: shopkeeper.assignedStock });
  } catch (err) {
    console.error("Error assigning stock:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET ALL REFILL REQUESTS
router.get("/refill-requests", requireAuth, requireAdmin, async (req, res) => {
  try {
    const RefillRequest = require("../models/RefillRequest");
    const requests = await RefillRequest.find()
      .populate("shopkeeper", "fullName shopName email phone")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching refill requests:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ UPDATE REFILL REQUEST STATUS
router.patch("/refill-requests/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const RefillRequest = require("../models/RefillRequest");
    const request = await RefillRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("shopkeeper", "fullName shopName");

    if (!request) return res.status(404).json({ error: "Request not found" });

    res.json({ message: `Request ${status.toLowerCase()} successfully`, request });
  } catch (err) {
    console.error("Error updating refill request status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;