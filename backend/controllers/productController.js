const Product = require("../models/Product");

// @route GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, sort, page = 1, limit = 12, featured } = req.query;
    const query = { isActive: true };

    if (keyword) query.name = { $regex: keyword, $options: "i" };
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.ratings = { $gte: Number(rating) };

    const sortOptions = {
      newest: { createdAt: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      rating: { ratings: -1 },
      popular: { sold: -1 },
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) { next(err); }
};

// @route GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// @route POST /api/products (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const images = req.files?.map(f => ({ public_id: f.filename, url: f.path })) || [];
    const product = await Product.create({ ...req.body, images });
    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

// @route PUT /api/products/:id (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const newImages = req.files?.map(f => ({ public_id: f.filename, url: f.path })) || [];
    const existingImages = JSON.parse(req.body.existingImages || "[]");
    const images = [...existingImages, ...newImages];

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
      { new: true, runValidators: true }
    );
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// @route DELETE /api/products/:id (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: "Product removed" });
  } catch (err) { next(err); }
};

// @route POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed)
      return res.status(400).json({ success: false, message: "You already reviewed this product" });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.updateRatings();
    await product.save();

    await product.populate("reviews.user", "name avatar");
    res.status(201).json({ success: true, reviews: product.reviews, ratings: product.ratings, numReviews: product.numReviews });
  } catch (err) { next(err); }
};

// @route DELETE /api/products/:id/reviews/:reviewId
exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    review.deleteOne();
    product.updateRatings();
    await product.save();
    res.json({ success: true, message: "Review deleted" });
  } catch (err) { next(err); }
};

// @route GET /api/products/categories
exports.getCategories = async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json({ success: true, categories });
};
