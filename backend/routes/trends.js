const express = require("express");
const router = express.Router();
const {
  getAllTrends,
  getTrendingProducts,
  getRisingTrends,
  getFallingTrends,
  getTrendByProductId,
  createTrend,
  updateTrend,
  deleteTrend,
  incrementSearchCount,
} = require("../controllers/trendController");

// Get all trends
router.get("/", getAllTrends);

// Get trending products (hot items)
router.get("/trending", getTrendingProducts);

// Get rising trends
router.get("/rising", getRisingTrends);

// Get falling trends
router.get("/falling", getFallingTrends);

// Get trend by product ID
router.get("/product/:productId", getTrendByProductId);

// Create a trend
router.post("/", createTrend);

// Update a trend
router.put("/:id", updateTrend);

// Delete a trend
router.delete("/:id", deleteTrend);

// Increment search count for a product
router.put("/search/:productId", incrementSearchCount);

module.exports = router;
