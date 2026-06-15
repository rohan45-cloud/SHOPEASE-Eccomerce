const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { sendEmail, orderConfirmEmail } = require("../utils/helpers");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Validate stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive)
        return res.status(400).json({ success: false, message: `${item.product?.name} is no longer available` });
      if (item.product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.product.name}` });
    }

    const itemsPrice = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice > 499 ? 0 : 49;
    const taxPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map(i => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images[0]?.url || "",
        price: i.price,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paymentMethod === "cod" ? false : false,
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send confirmation email (non-blocking)
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Order Confirmed — ShopEase",
        html: orderConfirmEmail(req.user.name, order._id, order.items, order.totalPrice),
      });
    } catch (e) { console.warn("Email failed:", e.message); }

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// @route POST /api/orders/razorpay
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in rupees
    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const rzOrder = await razorpay.orders.create(options);
    res.json({ success: true, order: rzOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { next(err); }
};

// @route POST /api/orders/:id/pay/razorpay
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid payment signature" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, paidAt: Date.now(), orderStatus: "confirmed",
        paymentResult: { id: razorpay_payment_id, status: "paid", updateTime: new Date().toISOString() } },
      { new: true }
    );

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @route GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @route GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @route GET /api/orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @route PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const update = { orderStatus: status };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (status === "delivered") update.deliveredAt = Date.now();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @route GET /api/orders/stats (admin)
exports.getOrderStats = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders, deliveredOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.countDocuments({ orderStatus: "delivered" }),
    ]);
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        deliveredOrders,
      },
    });
  } catch (err) { next(err); }
};
