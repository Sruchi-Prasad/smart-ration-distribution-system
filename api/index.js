require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const { requireAuth, requireAdmin } = require("./middleware/auth");
const { router: authRouter, seedAdmin } = require("./routes/auth");

const shopkeeperRoutes = require("./routes/shopkeeper");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/product");
const loginsRoute = require("./routes/logins");
const feedbackRoutes = require("./routes/feedback");
const User = require("./models/user");
const auditRoutes = require("./routes/auditLog");
const shopsRouter = require("./routes/shops");
const app = express();
const port = process.env.PORT || 8000;


// ============================
// ✅ MIDDLEWARES
// ============================

// CORS (important for Expo Web)

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parser
app.use(express.json());

// Session (optional if using JWT)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 1000 }
  })
);


// ============================
// ✅ DEBUG LOGGER
// ============================
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});


// ============================
// ✅ ROUTES
// ============================

app.use("/api/auth", authRouter);
app.use("/api/shopkeeper", shopkeeperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api", loginsRoute);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/shops", shopsRouter);

// ============================
// ✅ ADMIN DASHBOARD STATS
// ============================
app.get("/api/admin/panel", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersLogged = await User.countDocuments({
      role: "user",
      lastLogin: { $ne: null }
    });

    const shopkeepersLogged = await User.countDocuments({
      role: "shopkeeper",
      lastLogin: { $ne: null }
    });

    const recentLogins = await User.find({
      lastLogin: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const distributedUsers = await User.countDocuments({
      lastDistribution: { $ne: null }
    });

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


// ============================
// ✅ FETCH ALL USERS
// ============================
app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["user", "shopkeeper"] }
    });

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// ✅ DATABASE CONNECTION
// ============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seedAdmin();
  })
  .catch((error) =>
    console.error("❌ MongoDB Connection Error:", error)
  );


// ============================
// ✅ START SERVER
// ============================
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
