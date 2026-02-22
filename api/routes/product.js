const express = require("express");
const router = express.Router();

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

    await AuditLog.create({
      action: "Added Product",
      user: req.user.email,
      details: `Product: ${product.name}, Qty: ${product.quantity}, Price: ${product.price}`
    });

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

    await AuditLog.create({
      action: "Deleted Product",
      user: req.user.email,
      details: `Product: ${deleted.name}, ID: ${req.params.id}`
    });

    res.json({ success: true, message: "Product deleted", product: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
