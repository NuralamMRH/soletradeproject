const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { SubCategory } = require("../models/sub_category");
const {
  filesUpdatePromises,
  deleteFilesByFields,
} = require("../utils/fileUploader");

// @desc    Get all sub-categories
// @route   GET /api/v1/sub-categories
// @access  Public
exports.getSubCategories = catchAsyncErrors(async (req, res, next) => {
  const subCategories = await SubCategory.find().populate(
    "parentCategory",
    "name"
  );
  res.status(200).json({
    status: "success",
    results: subCategories.length,
    data: subCategories,
  });
});

// @desc    Get single sub-category
// @route   GET /api/v1/sub-categories/:id
// @access  Public
exports.getSubCategory = catchAsyncErrors(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id).populate(
    "parentCategory"
  );

  if (!subCategory) {
    return next(
      new ErrorHandler(`No sub-category found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: subCategory,
  });
});

// @desc    Create sub-category
// @route   POST /api/v1/sub-categories
// @access  Private/Admin
exports.createSubCategory = catchAsyncErrors(async (req, res, next) => {
  // Handle file upload
  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "sub-category"
  );
  const subCategory = await SubCategory.create({
    ...req.body,
    ...uploadedFile,
  });
  res.status(201).json({
    status: "success",
    data: subCategory,
  });
});

// @desc    Update sub-category
// @route   PUT /api/v1/sub-categories/:id
// @access  Private/Admin
exports.updateSubCategory = catchAsyncErrors(async (req, res, next) => {
  const sub_category = await SubCategory.findById(req.params.id);

  let uploadedFile = {};
  if (req.files && Object.keys(req.files).length > 0) {
    const fileFieldsToUpload = ["image"];
    uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      fileFieldsToUpload,
      "sub-category",
      sub_category
    );
  }

  const subCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ...uploadedFile },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subCategory) {
    return next(
      new ErrorHandler(`No sub-category found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: subCategory,
  });
});

// @desc    Delete sub-category
// @route   DELETE /api/v1/sub-categories/:id
// @access  Private/Admin
exports.deleteSubCategory = catchAsyncErrors(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    return next(
      new ErrorHandler(`No sub-category found with id: ${req.params.id}`, 404)
    );
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];

  // Delete all associated files using the function
  await deleteFilesByFields(subCategory, fileFieldsToDelete);

  // Delete the sub-category
  await SubCategory.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
