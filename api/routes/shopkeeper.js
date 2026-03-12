const express = require("express");
const router = express.Router();
const { authenticate, requireShopkeeper } = require("../middleware/auth");
const User = require("../models/user");
const RefillRequest = require("../models/RefillRequest");
const { getRationEntitlement } = require("../utils/ration");
const { requireAuth } = require("../middleware/auth");

// 🔹 GET /api/shopkeeper/users → only users assigned to this shopkeeper
router.get("/users", requireAuth, async (req, res) => {
  try {
    const users = await User.find({ role: "user", assignedShop: req.user.sub })
      .select("fullName email phone city members memberDetails lastLogin rationCard balance");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET /api/shopkeeper/incomplete-kyc → users with pending KYC
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

// 🔹 GET /api/shopkeeper/list → all registered shopkeepers (shops)
router.get("/list", requireAuth, async (req, res) => {
  try {
    const shops = await User.find({ role: "shopkeeper" })
      .select("fullName shopName phone city state");
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shops" });
  }
});

// 🔹 POST /api/shopkeeper/request-refill → shopkeeper requests stock refill
router.post("/request-refill", requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items specified for refill" });
    }

    const newRequest = new RefillRequest({
      shopkeeper: req.user.sub,
      items
    });

    await newRequest.save();
    res.status(201).json({ message: "Refill request sent successfully", request: newRequest });
  } catch (err) {
    console.error("Refill request error:", err);
    res.status(500).json({ message: "Failed to send refill request" });
  }
});

// 🔹 PATCH /api/shopkeeper/kyc/:userId → update head of household status & notify
router.patch("/kyc/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Verified", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kycStatus = status;
    await user.save();

    // Create Notification
    const Notification = require("../models/notification");
    const isRejected = status === "Rejected";
    const newNotif = new Notification({
      user: userId,
      title: isRejected ? "KYC Rejected ❌" : "KYC Status Update",
      body: isRejected
        ? `Your primary KYC was rejected. Please re-do it with correct details.`
        : `Your primary KYC has been set to ${status}.`,
      type: "kycReminder",
      metadata: { userId, status }
    });
    await newNotif.save();

    res.json({ message: "Household KYC status updated and user notified", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 PATCH /api/shopkeeper/member-kyc/:userId/:memberId → update status & notify
router.patch("/member-kyc/:userId/:memberId", requireAuth, async (req, res) => {
  try {
    const { userId, memberId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Verified", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const member = user.memberDetails.id(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.kycStatus = status;
    await user.save();

    // Create Notification
    const Notification = require("../models/notification");
    const isRejected = status === "Rejected";
    const newNotif = new Notification({
      user: userId,
      title: isRejected ? "KYC Rejected ❌" : "KYC Status Update",
      body: isRejected
        ? `KYC for family member ${member.name} was rejected. Please re-do it with correct details.`
        : `KYC for family member ${member.name} has been set to ${status}.`,
      type: "kycReminder",
      metadata: { memberId, memberName: member.name, status }
    });
    await newNotif.save();

    res.json({ message: "KYC status updated and user notified", member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stock", requireAuth, async (req, res) => {
  try {
    const shopkeeper = await User.findById(req.user.sub).select("assignedStock");
    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });
    res.json(shopkeeper.assignedStock);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 POST /api/shopkeeper/reset-balance/:userId → manually refill user quota
router.post("/reset-balance/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[Shopkeeper] Resetting balance for user: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[Shopkeeper] User not found for balance reset: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Recalculate based on current state and members
    const newBalance = getRationEntitlement(user.state, user.members, user.role);
    console.log(`[Shopkeeper] New calculated balance for ${user.fullName}:`, newBalance);
    user.balance = newBalance;
    await user.save();

    console.log(`[Shopkeeper] Successfully restored quota for ${user.fullName}`);
    res.json({ message: "Quota restored successfully", balance: user.balance });
  } catch (err) {
    console.error("[Shopkeeper] Quota reset error:", err);
    res.status(500).json({ message: "Failed to restore quota" });
  }
});

module.exports = router;