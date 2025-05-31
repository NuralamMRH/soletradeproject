const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { Indicator } = require("../models/indicator");
const { deleteFile, filesUpdatePromises } = require("../utils/fileUploader");

// @desc    Get all indicators
// @route   GET /api/v1/indicators
// @access  Public
exports.getIndicators = catchAsyncErrors(async (req, res, next) => {
  const indicators = await Indicator.find();
  res.status(200).json({
    status: "success",
    results: indicators.length,
    indicators,
  });
});

// @desc    Get single indicator
// @route   GET /api/v1/indicators/:id
// @access  Public
exports.getIndicator = catchAsyncErrors(async (req, res, next) => {
  const indicator = await Indicator.findById(req.params.id);

  if (!indicator) {
    return next(
      new ErrorHandler(`No indicator found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    indicator,
  });
});

// @desc    Create indicator
// @route   POST /api/v1/indicators
// @access  Private/Admin
exports.createIndicator = catchAsyncErrors(async (req, res, next) => {
  const fileFieldsToUpload = ["image"];
  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    fileFieldsToUpload,
    "indicator"
  );
  const indicator = await Indicator.create({ ...req.body, ...uploadedFile });
  res.status(201).json({
    status: "success",
    indicator,
  });
});

// @desc    Update indicator
// @route   PUT /api/v1/indicators/:id
// @access  Private/Admin
exports.updateIndicator = catchAsyncErrors(async (req, res, next) => {
  const sub_indicator = await Indicator.findById(req.params.id);

  let uploadedFile = {};
  if (req.files && Object.keys(req.files).length > 0) {
    const fileFieldsToUpload = ["image"];
    uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      fileFieldsToUpload,
      "indicator",
      sub_indicator
    );
  }

  const indicator = await Indicator.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ...uploadedFile },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!indicator) {
    return next(
      new ErrorHandler(`No indicator found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    indicator,
  });
});

// @desc    Delete indicator
// @route   DELETE /api/v1/indicators/:id
// @access  Private/Admin
exports.deleteIndicator = catchAsyncErrors(async (req, res, next) => {
  const sub_indicator = await Indicator.findById(req.params.id);

  // Delete the image file if it exists
  if (sub_indicator.image_full_url) {
    deleteFile(sub_indicator.image_full_url);
  }

  if (!sub_indicator) {
    return next(
      new ErrorHandler(`No indicator found with id: ${req.params.id}`, 404)
    );
  }

  const indicator = await Indicator.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
