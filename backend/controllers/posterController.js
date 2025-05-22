const Poster = require("../models/Poster");
const {
  filesUpdatePromises,
  deleteFilesByFields,
} = require("../utils/fileUploader");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Create a new poster
// @route   POST /api/v1/posters
// @access  Private/Admin
exports.createPoster = catchAsyncErrors(async (req, res, next) => {
  const fileFieldsToUpload = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    fileFieldsToUpload,
    "poster"
  );

  const poster = await Poster.create({
    ...req.body,
    ...uploadedFile,
  });

  res.status(201).json({
    success: true,
    data: poster,
  });
});

// @desc    Get all posters
// @route   GET /api/v1/posters
// @access  Public
exports.getPosters = catchAsyncErrors(async (req, res, next) => {
  const posters = await Poster.find().sort("-createdAt");

  res.status(200).json({
    success: true,
    count: posters.length,
    data: posters,
  });
});

// @desc    Get single poster
// @route   GET /api/v1/posters/:id
// @access  Public
exports.getPoster = catchAsyncErrors(async (req, res, next) => {
  const poster = await Poster.findById(req.params.id);

  if (!poster) {
    return next(new ErrorHandler("Poster not found", 404));
  }

  res.status(200).json({
    success: true,
    data: poster,
  });
});

// @desc    Update poster
// @route   PUT /api/v1/posters/:id
// @access  Private/Admin
exports.updatePoster = catchAsyncErrors(async (req, res, next) => {
  let poster = await Poster.findById(req.params.id);

  if (!poster) {
    return next(new ErrorHandler("Poster not found", 404));
  }

  let uploadedFile = {};
  if (req.files && Object.keys(req.files).length > 0) {
    const fileFieldsToUpload = ["image"];
    uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      fileFieldsToUpload,
      "poster",
      poster
    );
  }

  poster = await Poster.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...uploadedFile,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: poster,
  });
});

// @desc    Delete poster
// @route   DELETE /api/v1/posters/:id
// @access  Private/Admin
exports.deletePoster = catchAsyncErrors(async (req, res, next) => {
  const poster = await Poster.findById(req.params.id);

  if (!poster) {
    return next(new ErrorHandler("Poster not found", 404));
  }

  // Delete image file
  const fileFieldsToDelete = ["image"];
  await deleteFilesByFields(poster, fileFieldsToDelete);

  // Delete poster from database
  await poster.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
