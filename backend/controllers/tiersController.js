const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const Tier = require("../models/Tier");

exports.getAllTiers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Base query with population
    let query = Tier.find();

    // Apply APIFeatures for search, filter, and pagination
    const apiFeatures = new APIFeatures(query, req.query);
    await apiFeatures.search();
    await apiFeatures.filter();
    const result = await apiFeatures.execute();

    res.status(200).json({
      success: true,
      count: result.data.length,
      filteredCount: result.filteredCount,
      resPerPage: result.resPerPage,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      tiers: result.data,
    });
  } catch (error) {
    console.error("Error in getAllTiers:", error);
    next(error);
  }
});

exports.getTierById = catchAsyncErrors(async (req, res, next) => {
  const tier = await Tier.findById(req.params.id);

  if (!tier) {
    return next(new ErrorHandler("Tier not found", 404));
  }

  res.status(200).json({
    success: true,
    tier,
  });
});

exports.getTierCount = catchAsyncErrors(async (req, res, next) => {
  const tierCount = await Tier.countDocuments();

  if (!tierCount) {
    return next(new ErrorHandler("Error getting tier count", 500));
  }

  res.status(200).json({
    success: true,
    tierCount,
  });
});

exports.getTiersByTierType = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;

  if (!["buyer", "seller"].includes(type)) {
    return next(new ErrorHandler("Invalid tier type", 400));
  }

  const tiers = await Tier.find({ type });

  res.status(200).json({
    success: true,
    tiers,
  });
});

// @desc    Create a new tier
// @route   POST /api/v1/tiers
// @access  Private/Admin
exports.createTier = catchAsyncErrors(async (req, res, next) => {
  const tier = await Tier.create(req.body);

  res.status(201).json({
    success: true,
    data: tier,
  });
});

// @desc    Get single tier
// @route   GET /api/v1/tiers/:id
// @access  Public
exports.getTier = catchAsyncErrors(async (req, res, next) => {
  const tier = await Tier.findById(req.params.id);

  if (!tier) {
    return next(new ErrorHandler("Tier not found", 404));
  }

  res.status(200).json({
    success: true,
    data: tier,
  });
});

// @desc    Update tier
// @route   PUT /api/v1/tiers/:id
// @access  Private/Admin
exports.updateTier = catchAsyncErrors(async (req, res, next) => {
  let tier = await Tier.findById(req.params.id);

  if (!tier) {
    return next(new ErrorHandler("Tier not found", 404));
  }

  tier = await Tier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: tier,
  });
});

// @desc    Delete tier
// @route   DELETE /api/v1/tiers/:id
// @access  Private/Admin
exports.deleteTier = catchAsyncErrors(async (req, res, next) => {
  const tier = await Tier.findById(req.params.id);

  if (!tier) {
    return next(new ErrorHandler("Tier not found", 404));
  }

  await tier.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
