const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const crypto = require("crypto");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const generateOTP = require("../utils/otp");
const LoginModel = require("../models/Login");
const { getRationEntitlement } = require("../utils/ration");
const { signAccessToken, signRefreshToken, verifyRefresh, verifyAccess } = require("../utils/jwt");
const bcrypt = require("bcrypt");


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
    const { fullName, email, country, city, phone, aadhaarNumber, password, role, state, members, dateOfBirth, rationCard, memberDetails } = req.body;

    if (role === "user") {
      if (!state) return res.status(400).json({ message: "State is required for users" });
      if (await User.findOne({ aadhaarNumber })) return res.status(400).json({ message: "Aadhaar already registered" });
      if (await User.findOne({ rationCard })) return res.status(400).json({ message: "Ration card already registered" });
    }

    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });

    if (await User.findOne({ rationCard })) {
      return res.status(400).json({ message: "Ration card already registered" });
    }


    const newUser = new User({ fullName, email, aadhaarNumber, password, role, state, members, rationCard, country, phone, city, dateOfBirth, memberDetails });

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
// 🔑 Send OTP (User Aadhaar + Email OR Shopkeeper Email + Phone)
router.post("/send-otp", async (req, res) => {
  try {
    const { aadhaar, email, phone } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    let user;
    if (aadhaar) {
      user = await User.findOne({ aadhaarNumber: aadhaar, email, role: "user" });
    } else if (phone) {
      user = await User.findOne({ email, phone, role: "shopkeeper" });
    } else {
      user = await User.findOne({ email }); // fallback
    }

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP(); // 6-digit OTP generator
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    console.log(`OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent to registered email" });

  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔑 Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email, resetPasswordOtp: otp });
    if (!user || Date.now() > user.resetPasswordExpires) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Issue JWT tokens after OTP verification
    const accessToken = signAccessToken(user);
    const jti = crypto.randomUUID();
    const refreshToken = signRefreshToken(user, jti);
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({ success: true, message: "Authentication successful", user, accessToken, refreshToken });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// 🔑 Password Login
// 🔑 Password Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Fetch user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not registered" });

    // Optional: check role if provided
    if (role && user.role !== role) {
      return res.status(400).json({ message: `User not registered with role ${role}` });
    }

    // Compare password (plain text from frontend with hashed password in DB)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Update last login & balance (for users)
    user.lastLogin = new Date();
    if (user.role === "user") {
      user.balance = getRationEntitlement(user.state, user.members, user.role);
    }
    await user.save();

    // Generate tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user, crypto.randomUUID());

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Record login event
    await LoginModel.create({
      username: user.email,
      ipAddress: req.ip
    });

    res.status(200).json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔑 Forgot Password (Request OTP)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`Forgot password OTP for ${email}: ${otp}`);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔑 Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email, resetPasswordOtp: otp });
    if (!user || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword; // plain → hashed automatically by pre-save
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔄 Refresh Tokens
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Missing token" });

    const payload = verifyRefresh(refreshToken);
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
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// 🚪 Logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Missing token" });

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
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
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
// 📝 Get user by ID
router.get("/user/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    console.log("Fetched user from DB:", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add computed fields if needed
    const userData = {
      ...user.toObject(),
      cardType: "BPL (Priority)",   // or compute based on rationCard/state
      status: "Active"              // or compute based on rationCard existence
    };

    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = { router, seedAdmin };
