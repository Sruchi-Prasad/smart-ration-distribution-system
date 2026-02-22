const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const AuditLog = require("../models/auditLog");

// ✅ GET all audit logs
router.get("/", requireAuth, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD new audit log
router.post("/", requireAuth, async (req, res) => {
  try {
    const { action, user, details } = req.body;
    const log = new AuditLog({ action, user, details });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
