const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    dateOfBirth: {
      type: Date,
      required: false
    },
    kycStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending"
    },

    rationCard: {
      type: String,
      required: function () { return this.role === "user"; },
      unique: false
    },

    aadhaarNumber: {
      type: String,
      required: function () { return this.role === "user"; },
      unique: false,
      match: [/^\d{12}$/, "Aadhaar number must be 12 digits"]
    },

    members: {
      type: Number,
      required: function () { return this.role === "user"; }
    },
    memberDetails: [
      {
        name: String,
        age: Number,
        aadhaarNumber: String,
        kycStatus: {
          type: String,
          enum: ["Pending", "Verified", "Rejected"],
          default: "Pending"
        }
      }
    ],

    state: {
      type: String,
      required: function () { return this.role !== "admin"; },
      enum: ["Maharashtra", "Kerala", "Tamil Nadu", "Delhi", "West Bengal", "Other"]
    },
    fcmToken: {
      type: String,
      default: null
    },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: function () { return this.role !== "admin"; } },
    country: { type: String, required: function () { return this.role !== "admin"; } },
    city: { type: String, required: function () { return this.role !== "admin"; } },

    password: { type: String, required: true },

    balance: {
      rice: { type: Number, default: 0 },
      wheat: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      oil: { type: Number, default: 0 }
    },

    lastLogin: { type: Date, default: null },
    lastDistribution: { type: Date, default: null },
    lastKycReminderSent: { type: Date, default: null },

    issueDate: { type: Date, default: () => new Date() },
    expiryDate: { type: Date, default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 5)) },

    role: { type: String, enum: ["user", "admin", "shopkeeper"], default: "user" },

    shopName: { type: String, required: function () { return this.role === "shopkeeper"; } },
    assignedStock: {
      rice: { type: Number, default: 0 },
      wheat: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      oil: { type: Number, default: 0 }
    },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },

    assignedShop: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    refreshTokens: [
      { token: { type: String }, revokedAt: { type: Date } }
    ]
  },
  { timestamps: true }
);


// 🔒 Pre-save hook to hash password automatically
// In models/user.js

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// 🔑 Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model("User", userSchema);