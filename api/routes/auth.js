const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const crypto = require("crypto");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const generateOTP = require("../utils/otp");
const { getRationEntitlement } = require("../utils/ration");
const { signAccessToken, signRefreshToken, verifyRefresh, verifyAccess } = require("../utils/jwt");

// 🔑 Admin seeding
async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      await User.create({
        fullName: "Admin",
        email: "admin@example.com",
        password: "123456", // will be hashed
        role: "admin"
      });
      console.log("✅ Admin seeded");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
  }
}

// 📝 User Registration
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, country, city, phone, aadhaarNumber, password, role, state, members, dateOfBirth, rationCard ,memberDetails} = req.body;

    if (role === "user") {
      if (!state) return res.status(400).json({ message: "State is required for users" });
      if (await User.findOne({ aadhaarNumber })) return res.status(400).json({ message: "Aadhaar already registered" });
      if (await User.findOne({ rationCard })) return res.status(400).json({ message: "Ration card already registered" });
    }

    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });

    if (await User.findOne({ rationCard })) {
      return res.status(400).json({ message: "Ration card already registered" });
    }


    const newUser = new User({ fullName, email, aadhaarNumber, password, role, state, members, rationCard, country, phone, city, dateOfBirth,memberDetails });

    if (role === "user") {
      newUser.balance = getRationEntitlement(state, members, role);
    }

    await newUser.save();
    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ message: error.message });
  }
});

// 📝 Shopkeeper Registration
router.post("/register-shopkeeper", async (req, res) => {
  try {
    const { fullName, email, password, shopName, state, phone, country, city } = req.body;

    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });
    if (!shopName) return res.status(400).json({ message: "Shop name is required" });


    const newShopkeeper = new User({
      fullName,
      email,
      password,
      role: "shopkeeper",
      shopName,
      state,
      phone,
      country,
      city,
      assignedStock: { rice: 0, wheat: 0 }
    });

    await newShopkeeper.save();
    res.status(201).json({ message: "Shopkeeper registered successfully", user: newShopkeeper });
  } catch (error) {
    console.error("Shopkeeper register error:", error);
    res.status(400).json({ message: error.message });
  }
});

// 🔑 Send OTP (User Aadhaar + Email OR Shopkeeper Email + Phone)
router.post("/send-otp", async (req, res) => {
  const { aadhaar, email, phone } = req.body;

  let user;
  if (aadhaar) {
    user = await User.findOne({ aadhaarNumber: aadhaar, email, role: "user" });
  } else {
    user = await User.findOne({ email, phone, role: "shopkeeper" });
  }

  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const otp = generateOTP();
  req.session.otp = otp;
  req.session.otpExpires = Date.now() + 5 * 60 * 1000;
  req.session.userId = user._id;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`
  });

  console.log(`Dummy OTP for ${email}: ${otp}`);
  res.json({ success: true, message: "OTP sent to registered email" });
});

// 🔑 Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  if (!req.session.otp || Date.now() > req.session.otpExpires) {
    return res.status(401).json({ success: false, message: "OTP expired" });
  }

  if (parseInt(otp) === req.session.otp) {
    const user = await User.findById(req.session.userId);

    const accessToken = signAccessToken(user);
    const jti = crypto.randomUUID();
    const refreshToken = signRefreshToken(user, jti);

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return res.json({ success: true, message: "Authentication successful", user, accessToken, refreshToken });
  } else {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }
});

// 🔑 Password Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email, role });
  if (!user) return res.status(400).json({ message: "User not registered with this role" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  user.lastLogin = new Date();
  if (user.role === "user") {
    user.balance = getRationEntitlement(user.state, user.members, user.role);
  }
  await user.save();

  const accessToken = signAccessToken(user);
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken(user, jti);

  if (!user.refreshTokens) user.refreshTokens = [];
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  res.status(200).json({ message: "Login successful", user, accessToken, refreshToken });
});

// 🔄 Refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Missing token" });

  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "User not found" });

  const stored = user.refreshTokens.find(rt => rt.token === refreshToken && !rt.revokedAt);
  if (!stored) return res.status(401).json({ message: "Token revoked or not found" });

  stored.revokedAt = new Date();
  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user, crypto.randomUUID());
  user.refreshTokens.push({ token: newRefreshToken });
  await user.save();

  res.json({ user, accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// 🚪 Logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Missing token" });

  try {
    const payload = verifyRefresh(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(200).json({ message: "Logged out" });

    const stored = user.refreshTokens.find(rt => rt.token === refreshToken && !rt.revokedAt);
    if (stored) stored.revokedAt = new Date();
    await user.save();

    res.json({ message: "Logged out" });
  } catch {
    res.status(200).json({ message: "Logged out" });
  }
});



router.get("/admin/panel", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Existing counts
    const usersLogged = await User.countDocuments({ role: "user", lastLogin: { $ne: null } });
    const shopkeepersLogged = await User.countDocuments({ role: "shopkeeper", lastLogin: { $ne: null } });

    // New queries
    const recentLogins = await User.find({
      lastLogin: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
    });

    const distributedUsers = await User.countDocuments({ lastDistribution: { $ne: null } });

    const stateSummary = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: "$state", count: { $sum: 1 } } }
    ]);

    // Send everything back to frontend
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



module.exports = { router, seedAdmin };
