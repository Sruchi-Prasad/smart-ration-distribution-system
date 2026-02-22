const express = require("express");
const router = express.Router();
const Distribution = require("../models/distribution");
const AuditLog = require("../models/auditLog");
const { requireAuth } = require("../middleware/auth");

// ✅ ADD new distribution record
router.post("/", requireAuth, async (req, res) => {
  try {
    const { household, product, quantity, date } = req.body;
    const record = new Distribution({ household, product, quantity, date });
    await record.save();

    // 🔎 Create audit log
    await AuditLog.create({
      action: "New Distribution",
      user: req.user.email,
      details: `Household: ${household}, Product: ${product}, Qty: ${quantity}`
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
