const express = require("express");
const router = express.Router();
const Distribution = require("../models/distribution");
const AuditLog = require("../models/auditLog");
const User = require("../models/user");
const Product = require("../models/product");
const { requireAuth } = require("../middleware/auth");

// ✅ GET all distributions (for admins/audit)
router.get("/", requireAuth, async (req, res) => {
  try {
    const records = await Distribution.find()
      .populate("household")
      .populate("product")
      .populate("shopkeeper")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD new distribution record
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("Starting distribution save process...");
    const { household, product: productId, quantity, date } = req.body;

    const User = require("../models/user");
    const Product = require("../models/product");

    // 1. Fetch all involved entities
    const [user, shopkeeper, product] = await Promise.all([
      User.findById(household),
      User.findById(req.user.sub),
      Product.findById(productId)
    ]);

    if (!user) return res.status(404).json({ error: "Household not found" });
    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // 2. Determine product key (e.g., "rice" or "wheat")
    const prodKey = product.name.toLowerCase().includes("rice") ? "rice" :
      product.name.toLowerCase().includes("wheat") ? "wheat" :
        product.name.toLowerCase().includes("sugar") ? "sugar" :
          product.name.toLowerCase().includes("oil") ? "oil" : null;

    if (!prodKey) {
      return res.status(400).json({ error: `Product '${product.name}' is not trackable in balance.` });
    }

    // 3. Check sufficiency
    if (user.balance[prodKey] < quantity) {
      return res.status(400).json({ error: `Insufficient user balance. Available: ${user.balance[prodKey]}kg` });
    }
    if (shopkeeper.assignedStock[prodKey] < quantity) {
      return res.status(400).json({ error: `Insufficient shop stock. Available: ${shopkeeper.assignedStock[prodKey]}kg` });
    }

    // 4. Update balances and save
    user.balance[prodKey] -= quantity;
    shopkeeper.assignedStock[prodKey] -= quantity;

    const record = new Distribution({
      household,
      product: productId,
      shopkeeper: req.user.sub,
      quantity,
      date
    });

    console.log("[Distribution] Saving User balance...");
    await user.save();

    console.log("[Distribution] Saving Shopkeeper stock...");
    await shopkeeper.save();

    console.log("[Distribution] Saving Distribution record...");
    await record.save();

    console.log("✅ Distribution recorded successfully.");

    // 🔎 Create audit log
    try {
      console.log("Attempting to create audit log...");
      await AuditLog.create({
        action: "New Distribution",
        user: shopkeeper.email,
        details: `Household: ${user.fullName}, Product: ${product.name}, Qty: ${quantity}. New User Bal: ${user.balance[prodKey]}kg, New Shop Stock: ${shopkeeper.assignedStock[prodKey]}kg`
      });
      console.log("✅ Audit log created.");
    } catch (auditErr) {
      console.warn("⚠️ Audit log failed (non-critical):", auditErr.message);
      // We don't fail the whole request for a log failure
    }

    res.json({ message: "Distribution recorded successfully", record, newBalance: user.balance });
  } catch (err) {
    console.error("❌ ERROR in POST /distribution:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET user specific distribution history (for the logged-in user)
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const records = await Distribution.find({ household: req.user.sub })
      .populate("product")
      .populate("shopkeeper")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET history for current shopkeeper
router.get("/history", requireAuth, async (req, res) => {
  try {
    const records = await Distribution.find({ shopkeeper: req.user.sub })
      .populate("household", "fullName email rationCard")
      .populate("product")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET history for a specific user (for shopkeepers/admins)
router.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    const records = await Distribution.find({ household: req.params.userId })
      .populate("product")
      .populate("shopkeeper")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET distribution status for current month
router.get("/status/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const count = await Distribution.countDocuments({
      household: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    res.json({ status: count > 0 ? "Distributed" : "Pending" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;