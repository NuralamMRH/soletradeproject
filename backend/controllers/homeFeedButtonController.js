const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { HomeFeedButton } = require("../models/HomeFeedButton");
const APIFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const {
  deleteFile,
  filesUpdatePromises,
  fileUploadPromises,
  fileUpdatePromises,
  deleteFileByUrl,
} = require("../utils/fileUploader");

// @desc    Get all feedButtons
// @route   GET /api/v1/feedButtons
// @access  Public
exports.getFeedButtons = catchAsyncErrors(async (req, res, next) => {
  const { design } = req.query;
  let query = HomeFeedButton.find();

  // Filter by design if provided
  if (design) {
    query = query.where("design").equals(design);
  }

  // Sort by creation date
  query = query.sort({ createdAt: -1 });

  const feedButtons = await query;

  res.status(200).json({
    status: "success",
    results: feedButtons.length,
    data: feedButtons,
  });
});

// @desc    Get single feedButton
// @route   GET /api/v1/feedButtons/:id
// @access  Public
exports.getFeedButton = catchAsyncErrors(async (req, res, next) => {
  const feedButton = await HomeFeedButton.findById(req.params.id);

  if (!feedButton) {
    return next(
      new ErrorHandler(`No feedButton found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: feedButton,
  });
});

// @desc    Create feedButton
// @route   POST /api/v1/feedButtons
// @access  Private/Admin
exports.createFeedButton = catchAsyncErrors(async (req, res, next) => {
  const fileFieldsToUpload = ["image"];
  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    fileFieldsToUpload,
    "feedButton"
  );
  const feedButton = await HomeFeedButton.create({
    ...req.body,
    ...uploadedFile,
  });
  res.status(201).json({
    status: "success",
    data: feedButton,
  });
});

// @desc    Update feedButton
// @route   PUT /api/v1/feedButtons/:id
// @access  Private/Admin
exports.updateFeedButton = catchAsyncErrors(async (req, res, next) => {
  const homeFeedButton = await HomeFeedButton.findById(req.params.id);

  let uploadedFile = {};
  if (req.files && req.files.image && Object.keys(req.files).length > 0) {
    // Check if image is a string (URL) or a file
    if (typeof req.files.image === "string") {
      // If it's a string (URL), use it directly
      homeFeedButton.image = req.files.image;
      homeFeedButton.image_full_url = req.files.image;
    } else {
      // If it's a file, proceed with upload
      const fileFieldsToUpload = ["image"];
      uploadedFile = await filesUpdatePromises(
        req,
        res,
        next,
        fileFieldsToUpload,
        "feedButton"
      );
    }
  }

  const feedButton = await HomeFeedButton.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ...uploadedFile },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!feedButton) {
    return next(
      new ErrorHandler(`No feedButton found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: feedButton,
  });
});

// @desc    Delete feedButton
// @route   DELETE /api/v1/feedButtons/:id
// @access  Private/Admin
exports.deleteFeedButton = catchAsyncErrors(async (req, res, next) => {
  const homeFeedButton = await HomeFeedButton.findById(req.params.id);

  // Delete the image file if it exists
  if (homeFeedButton.image_full_url) {
    deleteFileByUrl(homeFeedButton.image_full_url);
  }

  if (!homeFeedButton) {
    return next(
      new ErrorHandler(`No feedButton found with id: ${req.params.id}`, 404)
    );
  }

  const feedButton = await HomeFeedButton.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
