const { Brand } = require("../models/brand");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  filesUpdatePromises,
  deleteFilesByFields,
} = require("../utils/fileUploader");

exports.getAllBrands = catchAsyncErrors(async (req, res, next) => {
  const brandList = await Brand.find().populate("subBrands");

  if (!brandList) {
    return next(new ErrorHandler("Brands not found", 500));
  }

  res.status(200).json({
    success: true,
    brands: brandList,
  });
});

exports.getBrandById = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id).populate("subBrands");

  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }

  res.status(200).json({
    success: true,
    brand,
  });
});

exports.createBrand = catchAsyncErrors(async (req, res, next) => {
  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "brand"
  );

  const brand = new Brand({
    ...uploadedFile,
    ...req.body,
  });

  const savedBrand = await brand.save();

  if (!savedBrand) {
    return next(new ErrorHandler("Error creating brand", 400));
  }

  res.status(201).json({
    success: true,
    brand: savedBrand,
  });
});

exports.updateBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }

  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "brand"
  );

  const updatedBrand = await Brand.findByIdAndUpdate(
    req.params.id,
    {
      ...uploadedFile,
      ...req.body,
    },
    { new: true }
  );

  if (!updatedBrand) {
    return next(new ErrorHandler("Error updating brand", 400));
  }

  res.status(200).json({
    success: true,
    brand: updatedBrand,
  });
});

exports.deleteBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];

  // Delete all associated files using the function
  await deleteFilesByFields(brand, fileFieldsToDelete);

  await Brand.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
});
