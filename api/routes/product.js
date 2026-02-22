const express = require("express");
const router = express.Router();
const User = require("../models/user");   // ✅ ADD THIS LINE
const Product = require("../models/product");
const AuditLog = require("../models/auditLog");   // ✅ import audit log model
const { requireAuth } = require("../middleware/auth");

// ==============================
// ✅ GET ALL PRODUCTS
// ==============================
router.get("/", requireAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// ✅ ADD PRODUCT
// ==============================
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("✅ ADD PRODUCT API HIT");
    console.log("Logged User from JWT:", req.user);
    const product = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      quantity: req.body.quantity,
      unit: req.body.unit,
      minStock: req.body.minStock,
      role: req.user.role
    });

    await product.save();
    console.log("✅ Product saved:", product.name);
    // 🔎 Get logged-in user from DB
    const currentUser = await User.findById(req.user.sub);
    console.log("✅ DB User Found:", currentUser?.email);
    // ✅ Create audit log
    await AuditLog.create({
      action: "Added Product",
      user: currentUser?.email || "Unknown User",
      details: `Product: ${product.name}, Qty: ${product.quantity}, Price: ${product.price}`
    });
    console.log("✅ Audit log saved:", audit);

    res.json({ success: true, product });   // 👈 always wrap response
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// ✅ UPDATE PRODUCT
// ==============================
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // 🔎 Create audit log
    await AuditLog.create({
      action: "Updated Product",
      user: req.user.email,
      details: `Product ID: ${req.params.id}`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// ✅ DELETE PRODUCT
// ==============================
// ✅ DELETE PRODUCT with audit logging
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    console.log("Deleting product:", req.params.id);

    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ get logged user from DB using JWT id
    const currentUser = await User.findById(req.user.sub);

    console.log("Delete performed by:", currentUser?.email);

    // ✅ create audit log
    await AuditLog.create({
      action: "Deleted Product",
      user: currentUser?.email || "Unknown User",
      details: `Product: ${deleted.name}, ID: ${req.params.id}`
    });

    console.log("✅ Delete audit log saved");

    res.json({
      success: true,
      message: "Product deleted",
      product: deleted
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
