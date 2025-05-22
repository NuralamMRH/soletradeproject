const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { SubBrand } = require("../models/sub_brand");
const {
  filesUpdatePromises,
  deleteFilesByFields,
} = require("../utils/fileUploader");

// @desc    Get all sub-brands
// @route   GET /api/v1/sub-brands
// @access  Public
exports.getSubBrands = catchAsyncErrors(async (req, res, next) => {
  const subBrands = await SubBrand.find().populate("parentBrand", "name");
  res.status(200).json({
    status: "success",
    results: subBrands.length,
    data: subBrands,
  });
});

// @desc    Get single sub-brand
// @route   GET /api/v1/sub-brands/:id
// @access  Public
exports.getSubBrand = catchAsyncErrors(async (req, res, next) => {
  const subBrand = await SubBrand.findById(req.params.id).populate(
    "parentBrand"
  );

  if (!subBrand) {
    return next(
      new ErrorHandler(`No sub-brand found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: subBrand,
  });
});

// @desc    Create sub-brand
// @route   POST /api/v1/sub-brands
// @access  Private/Admin
exports.createSubBrand = catchAsyncErrors(async (req, res, next) => {
  // Handle file upload
  const fileFieldsToUpload = ["image"];
  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    fileFieldsToUpload,
    "sub-brand"
  );

  // Create sub-brand with uploaded file data
  const subBrand = await SubBrand.create({
    ...req.body,
    ...uploadedFile,
  });

  res.status(201).json({
    status: "success",
    data: subBrand,
  });
});

// @desc    Update sub-brand
// @route   PUT /api/v1/sub-brands/:id
// @access  Private/Admin
exports.updateSubBrand = catchAsyncErrors(async (req, res, next) => {
  const sub_brand = await SubBrand.findById(req.params.id);

  let uploadedFile = {};
  if (req.files && Object.keys(req.files).length > 0) {
    const fileFieldsToUpload = ["image"];
    uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      fileFieldsToUpload,
      "sub-brand",
      sub_brand
    );
  }
  const subBrand = await SubBrand.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ...uploadedFile },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subBrand) {
    return next(
      new ErrorHandler(`No sub-brand found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: subBrand,
  });
});

// @desc    Delete sub-brand
// @route   DELETE /api/v1/sub-brands/:id
// @access  Private/Admin
exports.deleteSubBrand = catchAsyncErrors(async (req, res, next) => {
  const subBrand = await SubBrand.findById(req.params.id);

  if (!subBrand) {
    return next(
      new ErrorHandler(`No sub-brand found with id: ${req.params.id}`, 404)
    );
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];

  // Delete all associated files using the function
  await deleteFilesByFields(subBrand, fileFieldsToDelete);

  // Delete the sub-brand
  await SubBrand.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
