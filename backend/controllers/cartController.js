const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @route GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name images price stock isActive");
    if (!cart) return res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// @route POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < quantity)
      return res.status(400).json({ success: false, message: "Insufficient stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(i => i.product.toString() === productId);
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock)
        return res.status(400).json({ success: false, message: "Not enough stock" });
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    await cart.populate("items.product", "name images price stock");
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// @route PUT /api/cart/:productId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product", "name images price stock");
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// @route DELETE /api/cart/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate("items.product", "name images price stock");
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// @route DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) { next(err); }
};
