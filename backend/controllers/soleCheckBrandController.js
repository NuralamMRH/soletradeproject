const { SoleCheckBrand } = require("../models/SoleCheckBrand");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  deleteFilesByFields,
  filesUpdatePromises,
} = require("../utils/fileUploader");

exports.getAllSoleCheckBrands = catchAsyncErrors(async (req, res, next) => {
  const brandList = await SoleCheckBrand.find().populate("models");

  if (!brandList) {
    return next(new ErrorHandler("Sole check brands not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckBrands: brandList,
  });
});

exports.getSoleCheckBrandById = catchAsyncErrors(async (req, res, next) => {
  const brand = await SoleCheckBrand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorHandler("Sole check brand not found", 404));
  }

  res.status(200).json({
    success: true,
    soleCheckBrand: brand,
  });
});

exports.createSoleCheckBrand = catchAsyncErrors(async (req, res, next) => {
  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "brand"
  );

  const soleCheckBrand = new SoleCheckBrand({
    ...uploadedFile,
    ...req.body,
  });

  const savedBrand = await soleCheckBrand.save();

  if (!savedBrand) {
    return next(new ErrorHandler("Error creating sole check brand", 400));
  }

  res.status(201).json({
    success: true,
    soleCheckBrand: savedBrand,
  });
});

exports.updateSoleCheckBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await SoleCheckBrand.findById(req.params.id);
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

  const updatedBrand = await SoleCheckBrand.findByIdAndUpdate(
    req.params.id,
    {
      ...uploadedFile,
      ...req.body,
    },
    { new: true }
  );

  if (!updatedBrand) {
    return next(new ErrorHandler("Error updating sole check brand", 400));
  }

  res.status(200).json({
    success: true,
    soleCheckBrand: updatedBrand,
  });
});

exports.deleteSoleCheckBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await SoleCheckBrand.findById(req.params.id);

  if (!brand) {
    return next(new ErrorHandler("Sole check brand not found", 404));
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];
  // Delete all associated files using the function
  await deleteFilesByFields(brand, fileFieldsToDelete);

  await SoleCheckBrand.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Sole check brand deleted successfully",
  });
});

exports.getActiveSoleCheckBrands = catchAsyncErrors(async (req, res, next) => {
  const activeBrands = await SoleCheckBrand.find({ isActive: true });

  if (!activeBrands) {
    return next(new ErrorHandler("Active sole check brands not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckBrands: activeBrands,
  });
});
