require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { router: authRouter, seedAdmin } = require('./routes/auth');
const shopkeeperRoutes = require("./routes/shopkeeper"); // ✅ moved here
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 5 * 60 * 1000 }
}));

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/shopkeeper', shopkeeperRoutes); // ✅ mounted globally

// Admin dashboard stats
app.get("/api/admin/panel", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersLogged = await User.countDocuments({ role: "user", lastLogin: { $ne: null } });
    const shopkeepersLogged = await User.countDocuments({ role: "shopkeeper", lastLogin: { $ne: null } });

    const recentLogins = await User.find({
      lastLogin: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
    });

    const distributedUsers = await User.countDocuments({ lastDistribution: { $ne: null } });

    const stateSummary = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: "$state", count: { $sum: 1 } } }
    ]);

    res.json({
      usersLogged,
      shopkeepersLogged,
      recentLoginsCount: recentLogins.length,
      distributedUsers,
      stateSummary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW: Admin route to fetch all users + shopkeepers
app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["user", "shopkeeper"] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await seedAdmin();
  })
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
