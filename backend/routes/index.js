// routes/cart.js
const express = require("express");
const cartRouter = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

cartRouter.use(protect);
cartRouter.get("/", getCart);
cartRouter.post("/", addToCart);
cartRouter.put("/:productId", updateCartItem);
cartRouter.delete("/:productId", removeFromCart);
cartRouter.delete("/", clearCart);

// routes/orders.js
const orderRouter = express.Router();
const { createOrder, createRazorpayOrder, verifyRazorpayPayment, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats } = require("../controllers/orderController");
const { admin } = require("../middleware/auth");

orderRouter.use(protect);
orderRouter.post("/", createOrder);
orderRouter.post("/razorpay", createRazorpayOrder);
orderRouter.post("/:id/pay/razorpay", verifyRazorpayPayment);
orderRouter.get("/my", getMyOrders);
orderRouter.get("/stats", admin, getOrderStats);
orderRouter.get("/", admin, getAllOrders);
orderRouter.get("/:id", getOrder);
orderRouter.put("/:id/status", admin, updateOrderStatus);

// routes/admin.js
const adminRouter = express.Router();
const { getUsers, updateUserRole, deleteUser, getDashboard } = require("../controllers/adminController");

adminRouter.use(protect, admin);
adminRouter.get("/dashboard", getDashboard);
adminRouter.get("/users", getUsers);
adminRouter.put("/users/:id", updateUserRole);
adminRouter.delete("/users/:id", deleteUser);

module.exports = { cartRouter, orderRouter, adminRouter };
