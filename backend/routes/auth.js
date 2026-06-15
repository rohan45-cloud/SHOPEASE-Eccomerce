// routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, addAddress, deleteAddress, toggleWishlist } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/address", protect, addAddress);
router.delete("/address/:id", protect, deleteAddress);
router.put("/wishlist/:productId", protect, toggleWishlist);

module.exports = router;
