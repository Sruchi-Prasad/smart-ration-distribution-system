const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Product = require("../models/product");
const Purchase = require("../models/Purchase");
const User = require("../models/user");

// 🛒 Get available marketplace products (non-ration items)
router.get("/products", requireAuth, async (req, res) => {
    try {
        // Only fetch items that are not 'Rice' or 'Wheat' staples if we want to differentiate
        // but the request is for "extra buy" marketplace items.
        // Let's assume marketplace items have a specific category or are just all products.
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// 💳 Process a marketplace purchase
router.post("/purchase", requireAuth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        console.log(`🛒 [PURCHASE_START] User: ${req.user.sub}, Product: ${productId}, Qty: ${quantity}`);

        if (!productId || !quantity) {
            console.log("❌ Missing productId or quantity in request body");
            return res.status(400).json({ error: "Missing product or quantity" });
        }

        const user = await User.findById(req.user.sub);
        if (!user) {
            console.log(`❌ User not found in DB for ID: ${req.user.sub}`);
            return res.status(404).json({ error: "User account not found" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.log(`❌ Product not found in DB for ID: ${productId}`);
            return res.status(404).json({ error: "Product currently unavailable" });
        }

        if (product.quantity < quantity) {
            console.log(`❌ Insufficient stock for ${product.name}: Has ${product.quantity}, requested ${quantity}`);
            return res.status(400).json({ error: `Insufficient stock. Only ${product.quantity} available.` });
        }

        const totalPrice = product.price * quantity;
        console.log(`💰 Transaction Total: ₹${totalPrice} (Price: ${product.price} x ${quantity})`);

        // Create purchase record
        const purchase = new Purchase({
            user: user._id,
            productName: product.name,
            quantity: Number(quantity),
            totalPrice: Number(totalPrice),
            status: "Pending"
        });

        await purchase.save();
        console.log(`✅ Purchase record created: ${purchase._id}`);

        // Deduct stock
        product.quantity -= Number(quantity);
        await product.save();
        console.log(`📉 Stock updated for ${product.name}: New quantity: ${product.quantity}`);

        // 🔔 LOW STOCK ALERT
        if (product.quantity <= product.minStock) {
            console.log(`🔔 LOW STOCK ALERT: ${product.name} at ${product.quantity}`);
            try {
                const admins = await User.find({ role: "admin" }).select('_id');
                const shopkeepers = await User.find({ role: "shopkeeper" }).select('_id');
                const staff = [...admins, ...shopkeepers];

                if (staff.length > 0) {
                    const alertDocs = staff.map(s => ({
                        user: s._id,
                        title: "Low Stock Alert",
                        body: `Inventory for ${product.name} is critically low (${product.quantity} remaining).`,
                        type: "inventory",
                        metadata: { productId: product._id }
                    }));

                    const Notification = require("../models/notification");
                    await Notification.insertMany(alertDocs);
                    console.log(`📧 Low stock notifications sent to ${staff.length} staff members.`);
                }
            } catch (err) {
                console.error("⚠️ Stock alert notification failure (non-critical):", err.message);
            }
        }

        console.log("🏁 [PURCHASE_SUCCESS] Sending response to client");
        res.json({ success: true, message: "Purchase successful", purchase });
    } catch (err) {
        console.error("💥 [PURCHASE_ERROR]:", err);
        res.status(500).json({ error: "Checkout failed due to a server error." });
    }
});

// 📜 Get user's purchase history
router.get("/my-purchases", requireAuth, async (req, res) => {
    try {
        const purchases = await Purchase.find({ user: req.user.sub }).sort({ createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// 📋 Get all orders (Admin/Shopkeeper only)
router.get("/all-orders", requireAuth, async (req, res) => {
    if (req.user.role !== "admin" && req.user.role !== "shopkeeper") {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        const orders = await Purchase.find({}).populate("user", "fullName email rationCard").sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// ✅ Fulfill an order
router.patch("/order/:id/fulfill", requireAuth, async (req, res) => {
    if (req.user.role !== "admin" && req.user.role !== "shopkeeper") {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        const order = await Purchase.findByIdAndUpdate(req.params.id, { status: "Completed" }, { new: true });
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Send notification to user
        const Notification = require("../models/notification");
        await Notification.create({
            user: order.user,
            title: "Order Fulfilled",
            body: `Your order for ${order.productName} has been fulfilled and is ready for pickup/delivery.`,
            type: "purchase",
            metadata: { orderId: order._id }
        });

        res.json({ message: "Order fulfilled", order });
    } catch (err) {
        res.status(500).json({ error: "Fulfillment failed" });
    }
});

module.exports = router;
