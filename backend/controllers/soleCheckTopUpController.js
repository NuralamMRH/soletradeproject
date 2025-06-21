const { SoleCheckTopUp } = require("../models/SoleCheckTopUp");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  deleteFilesByFields,
  filesUpdatePromises,
} = require("../utils/fileUploader");

exports.getAllSoleCheckTopUps = catchAsyncErrors(async (req, res, next) => {
  const topUpList = await SoleCheckTopUp.find().sort({ createdAt: -1 });

  if (!topUpList) {
    return next(new ErrorHandler("Sole check top ups not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckTopUps: topUpList,
  });
});

exports.getSoleCheckTopUpById = catchAsyncErrors(async (req, res, next) => {
  const topUp = await SoleCheckTopUp.findById(req.params.id);

  if (!topUp) {
    return next(new ErrorHandler("Sole check top up not found", 404));
  }

  res.status(200).json({
    success: true,
    soleCheckTopUp: topUp,
  });
});

exports.createSoleCheckTopUp = catchAsyncErrors(async (req, res, next) => {
  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "topUp"
  );

  const soleCheckTopUp = new SoleCheckTopUp({
    ...uploadedFile,
    ...req.body,
  });

  const savedTopUp = await soleCheckTopUp.save();

  if (!savedTopUp) {
    return next(new ErrorHandler("Error creating sole check top up", 400));
  }

  res.status(201).json({
    success: true,
    soleCheckTopUp: savedTopUp,
  });
});

exports.updateSoleCheckTopUp = catchAsyncErrors(async (req, res, next) => {
  const topUp = await SoleCheckTopUp.findById(req.params.id);
  if (!topUp) {
    return next(new ErrorHandler("Top up not found", 404));
  }

  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "topUp"
  );

  const updatedTopUp = await SoleCheckTopUp.findByIdAndUpdate(
    req.params.id,
    {
      ...uploadedFile,
      ...req.body,
    },
    { new: true }
  );

  if (!updatedTopUp) {
    return next(new ErrorHandler("Error updating sole check top up", 400));
  }

  res.status(200).json({
    success: true,
    soleCheckTopUp: updatedTopUp,
  });
});

exports.deleteSoleCheckTopUp = catchAsyncErrors(async (req, res, next) => {
  const topUp = await SoleCheckTopUp.findById(req.params.id);

  if (!topUp) {
    return next(new ErrorHandler("Sole check top up not found", 404));
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];
  // Delete all associated files using the function
  await deleteFilesByFields(topUp, fileFieldsToDelete);

  await SoleCheckTopUp.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Sole check top up deleted successfully",
  });
});

exports.deleteManySoleCheckTopUps = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input

    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const soleCheckTopUps = await SoleCheckTopUp.find({
      _id: { $in: req.body.ids },
    });

    if (!soleCheckTopUps || soleCheckTopUps.length === 0) {
      return next(new ErrorHandler("Sole check top ups not found", 404));
    }

    // Perform deletion
    await SoleCheckTopUp.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Sole check top ups have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Error deleting sole check top ups: ${error.message}`,
        500
      )
    );
  }
});
