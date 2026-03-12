const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin, requireShopkeeper } = require('../middleware/auth');
const crypto = require("crypto");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const generateOTP = require("../utils/otp");
const LoginModel = require("../models/Login");
const { getRationEntitlement } = require("../utils/ration");
const { signAccessToken, signRefreshToken, verifyRefresh, verifyAccess } = require("../utils/jwt");
const bcrypt = require("bcrypt");
const admin = require("../config/firebase");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const Notification = require("../models/notification");


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
router.post("/login", async (req, res) => {
  try {
    const { email, rationCard, password, role } = req.body;

    if (role === "user") {
      if (!rationCard) {
        return res.status(400).json({ message: "Ration Card is required" });
      }
    } else {
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
    }

    // Fetch user based on role
    let user;
    if (role === "user") {
      user = await User.findOne({ rationCard, role: "user" });
    } else {
      user = await User.findOne({ email, role });
    }

    if (!user) return res.status(400).json({ message: "User not registered" });

    // Compare password (only for non-user roles)
    if (role !== "user") {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    }

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
      username: user.email || user.rationCard,
      ipAddress: req.ip
    });

    res.status(200).json({ message: "Login successful", user, accessToken, refreshToken });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure issue and expiry dates are present
    const issueDate = user.issueDate || new Date();
    const expiryDate = user.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 5));

    // Add computed fields
    const userData = {
      ...user.toObject(),
      issueDate,
      expiryDate,
      cardType: "BPL (Priority)",
      status: "Active"
    };

    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📱 Save FCM Token
router.post("/save-token", requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    // req.user from middleware has 'sub' for ID
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.fcmToken = token;
    await user.save();

    res.json({ message: "Token saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔔 Admin or Shopkeeper sends KYC reminder
router.post("/send-kyc-reminder", requireAuth, async (req, res) => {
  if (req.user.role !== "shopkeeper" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: unauthorized role" });
  }
  try {
    const { userId } = req.body;
    let usersToSend = [];

    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.kycStatus === "Verified") {
        return res.status(400).json({ message: "User KYC already completed" });
      }
      usersToSend = [user];
    } else {
      usersToSend = await User.find({ kycStatus: { $in: ["Pending", "Rejected"] } });
    }

    let sentCount = 0;
    let emailsSent = 0;
    let skippedNoToken = 0;
    let skippedRateLimit = 0;
    let failedCount = 0;
    let messages = [];
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Identify non-rate-limited users
    const usersToProcess = usersToSend.filter(u =>
      !(u.lastKycReminderSent && new Date(u.lastKycReminderSent) > twentyFourHoursAgo)
    );
    skippedRateLimit = usersToSend.length - usersToProcess.length;

    if (usersToProcess.length > 0) {
      // 2. Save in-app Notifications to DB
      const notificationDocs = usersToProcess.map(u => ({
        user: u._id,
        title: "KYC Reminder",
        body: "Please complete your KYC to continue using services.",
        type: "kycReminder",
        metadata: { type: "kycReminder" }
      }));
      await Notification.insertMany(notificationDocs);

      // 3. Update lastKycReminderSent
      const userIds = usersToProcess.map(u => u._id);
      await User.updateMany({ _id: { $in: userIds } }, { lastKycReminderSent: now });

      // 4. Send Email Reminders
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        for (let u of usersToProcess) {
          if (u.email) {
            try {
              await transporter.sendMail({
                from: `"Smart Ration System" <${process.env.EMAIL_USER}>`,
                to: u.email,
                subject: "⚠️ Action Required: Complete Your KYC Verification",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: #003366; padding: 24px; text-align: center;">
                      <h2 style="color: white; margin: 0;">Smart Ration System</h2>
                      <p style="color: #FF9933; margin: 6px 0 0;">KYC Verification Required</p>
                    </div>
                    <div style="padding: 24px;">
                      <p>Dear <strong>${u.fullName}</strong>,</p>
                      <p>Your KYC verification is <strong style="color:#D32F2F;">pending</strong>. Please complete it to continue receiving ration benefits without interruption.</p>
                      <p style="background: #FFF3E0; padding: 12px; border-radius: 8px; border-left: 4px solid #FF9933;">
                        ⚠️ Unverified accounts may be restricted from accessing distribution services.
                      </p>
                      <p>Please log into the app and complete your KYC today.</p>
                      <p style="margin-top: 24px; color: #999; font-size: 12px;">– Smart Ration Distribution System</p>
                    </div>
                  </div>
                `
              });
              emailsSent++;
            } catch (mailErr) {
              console.error(`Email failed for ${u.email}:`, mailErr.message);
            }
          }
        }
      } catch (transportErr) {
        console.error("Email transporter error:", transportErr.message);
      }

      // 5. Prepare Push Notification Messages
      for (let user of usersToProcess) {
        if (user.fcmToken && Expo.isExpoPushToken(user.fcmToken)) {
          messages.push({
            to: user.fcmToken,
            sound: "default",
            title: "KYC Reminder",
            body: "Please complete your KYC to continue using services.",
            data: { type: "kycReminder" },
            _user: user
          });
        } else {
          skippedNoToken++;
        }
      }

      // 6. Send Push Chunks
      if (messages.length > 0) {
        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            for (let i = 0; i < ticketChunk.length; i++) {
              if (ticketChunk[i].status === "ok") sentCount++;
              else failedCount++;
            }
          } catch (error) {
            console.error("Chunk send error:", error);
            failedCount += chunk.length;
          }
        }
      }
    }

    const summary = `In-app notifications: ${usersToProcess.length} | Emails sent: ${emailsSent} | Push sent: ${sentCount} | Skipped (rate-limit): ${skippedRateLimit}`;
    console.log(`[KYC Reminder Summary] ${summary}`);

    res.json({
      success: true,
      notificationsSaved: usersToProcess.length,
      emailsSent,
      sentCount,
      skippedNoToken,
      skippedRateLimit,
      failedCount,
      message: summary
    });

  } catch (err) {
    console.error("KYC Reminder API error:", err);
    res.status(500).json({ error: "Failed to process KYC reminders" });
  }
});

// ============================
// ✅ FETCH NOTIFICATIONS
// ============================
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ✅ MARK AS READ
router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// ✅ DELETE SPECIFIC NOTIFICATION
router.delete("/notifications/:id", requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub
    });
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// ✅ MARK ALL NOTIFICATIONS AS READ
router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.sub, read: false }, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// ✅ DELETE ALL NOTIFICATIONS
router.delete("/notifications", requireAuth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.sub });
    res.json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// 🔒 Submit Member KYC details
router.post("/member-kyc-submit", requireAuth, async (req, res) => {
  try {
    const { memberId, name, age, aadhaarNumber } = req.body;
    const user = await User.findById(req.user.sub);

    if (!user) return res.status(404).json({ message: "User not found" });

    const member = user.memberDetails.id(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Update member fields
    if (name) member.name = name;
    if (age) member.age = age;
    if (aadhaarNumber) member.aadhaarNumber = aadhaarNumber;

    // Set member status to Pending for review
    member.kycStatus = "Pending";

    await user.save();

    // ✅ Notify assigned shopkeeper
    if (user.assignedShop) {
      const Notification = require("../models/notification");
      await Notification.create({
        user: user.assignedShop,
        title: "Member KYC Submitted",
        body: `Member ${member.name} of household ${user.fullName} has submitted KYC details.`,
        type: "kycReminder",
        metadata: { userId: user._id, memberId: member._id, type: "member" }
      });
    }

    res.json({ message: "Member KYC submitted successfully", user });
  } catch (err) {
    console.error("Member KYC Submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔒 Submit KYC details
router.post("/kyc-submit", requireAuth, async (req, res) => {
  try {
    const { fullName, phone, email, city, country, aadhaarNumber, rationCard } = req.body;
    const user = await User.findById(req.user.sub);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (city) user.city = city;
    if (country) user.country = country;
    if (aadhaarNumber) user.aadhaarNumber = aadhaarNumber;
    if (rationCard) user.rationCard = rationCard;

    // Set status to Pending for review
    user.kycStatus = "Pending";

    await user.save();

    // ✅ Notify assigned shopkeeper
    if (user.assignedShop) {
      const Notification = require("../models/notification");
      await Notification.create({
        user: user.assignedShop,
        title: "Household KYC Submitted",
        body: `Head of Household ${user.fullName} has submitted their KYC details.`,
        type: "kycReminder",
        metadata: { userId: user._id, type: "head" }
      });
    }

    res.json({ message: "KYC submitted successfully", user });
  } catch (err) {
    console.error("KYC Submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = { router, seedAdmin };