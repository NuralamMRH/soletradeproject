const express = require("express");
const router = express.Router();
const {
  getAllWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  getWishlistByUser,
  getWishlistByProduct,
  toggleWishlist,
} = require("../controllers/wishlistController");
const { isAuthenticatedUser } = require("../middlewares/auth");

// Get all wishlists for current user
router.get("/", isAuthenticatedUser, getAllWishlists);

// Get wishlist by ID
router.get("/:id", isAuthenticatedUser, getWishlistById);

// Create new wishlist
router.post("/", isAuthenticatedUser, createWishlist);

// Update wishlist
router.put("/:id", isAuthenticatedUser, updateWishlist);

// Delete wishlist
router.delete("/:id", isAuthenticatedUser, deleteWishlist);

// Get wishlist by product ID
router.get("/product/:productId", isAuthenticatedUser, getWishlistByProduct);

// Toggle wishlist status
router.post("/toggle", isAuthenticatedUser, toggleWishlist);

module.exports = router;
