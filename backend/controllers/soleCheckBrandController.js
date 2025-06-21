const { SoleCheckBrand } = require("../models/SoleCheckBrand");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  deleteFilesByFields,
  filesUpdatePromises,
} = require("../utils/fileUploader");

exports.getAllSoleCheckBrands = catchAsyncErrors(async (req, res, next) => {
  const brandList = await SoleCheckBrand.find()
    .populate("models")
    .populate("categories");

  if (!brandList) {
    return next(new ErrorHandler("Sole check brands not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckBrands: brandList,
  });
});

exports.getSoleCheckBrandById = catchAsyncErrors(async (req, res, next) => {
  const brand = await SoleCheckBrand.findById(req.params.id).populate(
    "categories"
  );

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
  try {
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
  } catch (error) {
    console.log("Error updating sole check brand", error);
    return next(
      new ErrorHandler(`Error updating sole check brand: ${error.message}`, 500)
    );
  }
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

exports.deleteManySoleCheckBrands = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input

    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const soleCheckBrands = await SoleCheckBrand.find({
      _id: { $in: req.body.ids },
    });

    if (!soleCheckBrands || soleCheckBrands.length === 0) {
      return next(new ErrorHandler("Sole check brands not found", 404));
    }

    // Perform deletion
    await SoleCheckBrand.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Sole check brands have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Error deleting sole check brands: ${error.message}`,
        500
      )
    );
  }
});
