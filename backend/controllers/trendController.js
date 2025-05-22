const { Trend } = require("../models/trend");
const { Product } = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Get all trends
exports.getAllTrends = catchAsyncErrors(async (req, res, next) => {
  const trends = await Trend.find()
    .populate("product")
    .populate("category")
    .populate("brand")
    .sort({ updatedAt: -1 });

  if (!trends) {
    return next(new ErrorHandler("Trends not found", 404));
  }

  res.status(200).json({
    success: true,
    trends,
  });
});

// Get trending products (hot items)
exports.getTrendingProducts = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10, category, brand } = req.query;

  let query = { isHot: true };

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  const trendingProducts = await Trend.find(query)
    .populate("product")
    .populate("category")
    .populate("brand")
    .sort({ popularity: -1 })
    .limit(parseInt(limit));

  if (!trendingProducts) {
    return next(new ErrorHandler("Trending products not found", 404));
  }

  res.status(200).json({
    success: true,
    trendingProducts,
  });
});

// Get rising trends
exports.getRisingTrends = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const risingTrends = await Trend.find({ isRising: true })
    .populate("product")
    .populate("category")
    .populate("brand")
    .sort({ changePercentage: -1 })
    .limit(parseInt(limit));

  if (!risingTrends) {
    return next(new ErrorHandler("Rising trends not found", 404));
  }

  res.status(200).json({
    success: true,
    risingTrends,
  });
});

// Get falling trends
exports.getFallingTrends = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const fallingTrends = await Trend.find({ isFalling: true })
    .populate("product")
    .populate("category")
    .populate("brand")
    .sort({ changePercentage: 1 })
    .limit(parseInt(limit));

  if (!fallingTrends) {
    return next(new ErrorHandler("Falling trends not found", 404));
  }

  res.status(200).json({
    success: true,
    fallingTrends,
  });
});

// Get trend by product ID
exports.getTrendByProductId = catchAsyncErrors(async (req, res, next) => {
  const productId = req.params.productId;

  const trend = await Trend.findOne({ product: productId })
    .populate("product")
    .populate("category")
    .populate("brand");

  if (!trend) {
    return next(new ErrorHandler("Trend not found for this product", 404));
  }

  res.status(200).json({
    success: true,
    trend,
  });
});

// Create a trend
exports.createTrend = catchAsyncErrors(async (req, res, next) => {
  const {
    product,
    category,
    brand,
    price,
    popularity,
    salesVolume,
    searchCount,
    isHot,
    isRising,
    isFalling,
    isStable,
  } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Check if trend already exists for this product
  const existingTrend = await Trend.findOne({ product });
  if (existingTrend) {
    return next(new ErrorHandler("Trend already exists for this product", 400));
  }

  const newTrend = new Trend({
    product,
    category,
    brand,
    priceHistory: [
      {
        price,
        percentageChange: 0,
      },
    ],
    popularity: popularity || 0,
    salesVolume: salesVolume || 0,
    searchCount: searchCount || 0,
    isHot: isHot || false,
    isRising: isRising || false,
    isFalling: isFalling || false,
    isStable: isStable !== undefined ? isStable : true,
  });

  const savedTrend = await newTrend.save();

  res.status(201).json({
    success: true,
    trend: savedTrend,
  });
});

// Update a trend
exports.updateTrend = catchAsyncErrors(async (req, res, next) => {
  const trendId = req.params.id;
  const {
    price,
    popularity,
    salesVolume,
    searchCount,
    isHot,
    isRising,
    isFalling,
    isStable,
  } = req.body;

  const trend = await Trend.findById(trendId);

  if (!trend) {
    return next(new ErrorHandler("Trend not found", 404));
  }

  // Update price history if new price is provided
  if (price) {
    const lastPrice =
      trend.priceHistory.length > 0
        ? trend.priceHistory[trend.priceHistory.length - 1].price
        : 0;

    const percentageChange =
      lastPrice > 0 ? ((price - lastPrice) / lastPrice) * 100 : 0;

    trend.priceHistory.push({
      price,
      percentageChange,
    });

    trend.changePercentage = percentageChange;

    // Update trend status based on price change
    if (percentageChange > 5) {
      trend.isRising = true;
      trend.isFalling = false;
      trend.isStable = false;
    } else if (percentageChange < -5) {
      trend.isRising = false;
      trend.isFalling = true;
      trend.isStable = false;
    } else {
      trend.isRising = false;
      trend.isFalling = false;
      trend.isStable = true;
    }
  }

  // Update other fields if provided
  if (popularity !== undefined) trend.popularity = popularity;
  if (salesVolume !== undefined) trend.salesVolume = salesVolume;
  if (searchCount !== undefined) trend.searchCount = searchCount;
  if (isHot !== undefined) trend.isHot = isHot;
  if (isRising !== undefined) trend.isRising = isRising;
  if (isFalling !== undefined) trend.isFalling = isFalling;
  if (isStable !== undefined) trend.isStable = isStable;

  trend.updatedAt = Date.now();

  const updatedTrend = await trend.save();

  res.status(200).json({
    success: true,
    trend: updatedTrend,
  });
});

// Delete a trend
exports.deleteTrend = catchAsyncErrors(async (req, res, next) => {
  const trendId = req.params.id;

  const trend = await Trend.findByIdAndDelete(trendId);

  if (!trend) {
    return next(new ErrorHandler("Trend not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Trend deleted successfully",
  });
});

// Update trend when a product is searched
exports.incrementSearchCount = catchAsyncErrors(async (req, res, next) => {
  const productId = req.params.productId;

  const trend = await Trend.findOne({ product: productId });

  if (!trend) {
    return next(new ErrorHandler("Trend not found for this product", 404));
  }

  trend.searchCount += 1;
  trend.updatedAt = Date.now();

  // Update popularity based on search count
  trend.popularity = calculatePopularity(trend);

  // Update trend status
  if (trend.popularity > 80) {
    trend.isHot = true;
  }

  const updatedTrend = await trend.save();

  res.status(200).json({
    success: true,
    trend: updatedTrend,
  });
});

// Helper function to calculate popularity score
const calculatePopularity = (trend) => {
  // This is a simple example - you may want to implement a more sophisticated algorithm
  const salesWeight = 0.4;
  const searchWeight = 0.4;
  const priceChangeWeight = 0.2;

  const salesScore = Math.min(trend.salesVolume / 10, 100);
  const searchScore = Math.min(trend.searchCount / 100, 100);
  const priceChangeScore = Math.abs(trend.changePercentage);

  return (
    salesWeight * salesScore +
    searchWeight * searchScore +
    priceChangeWeight * priceChangeScore
  );
};
