const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middlewares/auth");
const {
  getAllRecentViewedItems,
  getRecentViewedItemById,
  deleteRecentViewedItem,
  deleteManyRecentViewedItems,
} = require("../controllers/log/recentViewedController");

// Get all search items for current user
router.get("/", isAuthenticatedUser, getAllRecentViewedItems);

// Get search item by ID
router.get("/:id", isAuthenticatedUser, getRecentViewedItemById);

// Delete search item
router.delete("/:id", isAuthenticatedUser, deleteRecentViewedItem);

// Delete many search items
router.delete("/", isAuthenticatedUser, deleteManyRecentViewedItems);

module.exports = router;
