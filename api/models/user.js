const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    dateOfBirth: {
      type: Date,
      required: function () { return this.role === "user"; }
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
      { name: String, age: Number }
    ],

    state: {
      type: String,
      required: function () { return this.role !== "admin"; },
      enum: ["Maharashtra", "Kerala", "Tamil Nadu", "Delhi", "West Bengal", "Other"]
    },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: function () { return this.role !== "admin"; } },
    country: { type: String, required: function () { return this.role !== "admin"; } },
    city: { type: String, required: function () { return this.role !== "admin"; } },

    password: { type: String, required: true },

    balance: {
      rice: { type: Number, default: 0 },
      wheat: { type: Number, default: 0 }
    },

    lastLogin: { type: Date, default: null },
    lastDistribution: { type: Date, default: null },

    role: { type: String, enum: ["user", "admin", "shopkeeper"], default: "user" },

    shopName: { type: String, required: function () { return this.role === "shopkeeper"; } },
    assignedStock: {
      rice: { type: Number, default: 0 },
      wheat: { type: Number, default: 0 }
    },



    refreshTokens: [
      { token: { type: String }, revokedAt: { type: Date } }
    ]
  },
  { timestamps: true }
);


// 🔒 Pre-save hook to hash password automatically
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model("User", userSchema);
