const { SoleCheckModel } = require("../models/SoleCheckModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  deleteFilesByFields,
  filesUpdatePromises,
} = require("../utils/fileUploader");

exports.getAllSoleCheckModels = catchAsyncErrors(async (req, res, next) => {
  const modelList = await SoleCheckModel.find();

  if (!modelList) {
    return next(new ErrorHandler("Sole check models not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckModels: modelList,
  });
});

exports.getSoleCheckModelById = catchAsyncErrors(async (req, res, next) => {
  const model = await SoleCheckModel.findById(req.params.id)
    .populate("brands")
    .populate("models")
    .populate("labels");

  if (!model) {
    return next(new ErrorHandler("Sole check model not found", 404));
  }

  res.status(200).json({
    success: true,
    soleCheckModels: model,
  });
});

exports.createSoleCheckModel = catchAsyncErrors(async (req, res, next) => {
  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "model"
  );

  const soleCheckModel = new SoleCheckModel({
    ...uploadedFile,
    ...req.body,
  });

  const savedModel = await soleCheckModel.save();

  if (!savedModel) {
    return next(new ErrorHandler("Error creating sole check model", 400));
  }

  res.status(201).json({
    success: true,
    soleCheckModel: savedModel,
  });
});

exports.updateSoleCheckModel = catchAsyncErrors(async (req, res, next) => {
  const model = await SoleCheckModel.findById(req.params.id);
  if (!model) {
    return next(new ErrorHandler("Model not found", 404));
  }

  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "model"
  );

  const updatedModel = await SoleCheckModel.findByIdAndUpdate(
    req.params.id,
    {
      ...uploadedFile,
      ...req.body,
    },
    { new: true }
  );

  if (!updatedModel) {
    return next(new ErrorHandler("Error updating sole check model", 400));
  }

  res.status(200).json({
    success: true,
    soleCheckModel: updatedModel,
  });
});

exports.deleteSoleCheckModel = catchAsyncErrors(async (req, res, next) => {
  const model = await SoleCheckModel.findById(req.params.id);

  if (!model) {
    return next(new ErrorHandler("Sole check model not found", 404));
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];
  // Delete all associated files using the function
  await deleteFilesByFields(model, fileFieldsToDelete);

  await SoleCheckBrand.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Sole check model deleted successfully",
  });
});

exports.getSoleCheckModelsByBrand = catchAsyncErrors(async (req, res, next) => {
  const models = await SoleCheckModel.find({
    soleCheckBrand: req.params.brandId,
  });

  if (!models) {
    return next(new ErrorHandler("Sole check models not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckModels: models,
  });
});

exports.deleteManySoleCheckModels = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input

    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const soleCheckModels = await SoleCheckModel.find({
      _id: { $in: req.body.ids },
    });

    if (!soleCheckModels || soleCheckModels.length === 0) {
      return next(new ErrorHandler("Sole check models not found", 404));
    }

    // Perform deletion
    await SoleCheckModel.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Sole check models have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Error deleting sole check models: ${error.message}`,
        500
      )
    );
  }
});
