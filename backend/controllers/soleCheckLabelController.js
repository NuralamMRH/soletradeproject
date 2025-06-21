const { SoleCheckLabel } = require("../models/SoleCheckLabel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  deleteFilesByFields,
  filesUpdatePromises,
} = require("../utils/fileUploader");

exports.getAllSoleCheckLabels = catchAsyncErrors(async (req, res, next) => {
  const labelList = await SoleCheckLabel.find().sort({ createdAt: -1 });

  if (!labelList) {
    return next(new ErrorHandler("Sole check labels not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckLabels: labelList,
  });
});

exports.getSoleCheckLabelById = catchAsyncErrors(async (req, res, next) => {
  const label = await SoleCheckLabel.findById(req.params.id);

  if (!label) {
    return next(new ErrorHandler("Sole check label not found", 404));
  }

  res.status(200).json({
    success: true,
    soleCheckLabel: label,
  });
});

exports.createSoleCheckLabel = catchAsyncErrors(async (req, res, next) => {
  try {
    const imageFields = ["image"];

    const uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      imageFields,
      "label"
    );

    const soleCheckLabel = new SoleCheckLabel({
      ...uploadedFile,
      ...req.body,
    });

    const savedLabel = await soleCheckLabel.save();

    if (!savedLabel) {
      return next(new ErrorHandler("Error creating sole check label", 400));
    }

    res.status(201).json({
      success: true,
      soleCheckLabel: savedLabel,
    });
  } catch (error) {
    return next(new ErrorHandler("Error creating sole check label", 400));
  }
});

exports.updateSoleCheckLabel = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("req.body", req.body);
    const label = await SoleCheckLabel.findById(req.params.id);
    if (!label) {
      return next(new ErrorHandler("Sole check label not found", 404));
    }

    const imageFields = ["image"];

    const uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      imageFields,
      "label"
    );

    const updatedLabel = await SoleCheckLabel.findByIdAndUpdate(
      req.params.id,
      {
        ...uploadedFile,
        ...req.body,
      },
      { new: true }
    );

    if (!updatedLabel) {
      return next(new ErrorHandler("Error updating sole check label", 400));
    }

    res.status(200).json({
      success: true,
      soleCheckLabel: updatedLabel,
    });
  } catch (error) {
    // console.log("error", error);
    return next(new ErrorHandler("Error updating sole check label", 400));
  }
});

exports.deleteSoleCheckLabel = catchAsyncErrors(async (req, res, next) => {
  const label = await SoleCheckLabel.findById(req.params.id);

  if (!label) {
    return next(new ErrorHandler("Sole check label not found", 404));
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];
  // Delete all associated files using the function
  await deleteFilesByFields(label, fileFieldsToDelete);

  await SoleCheckLabel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Sole check label deleted successfully",
  });
});

exports.deleteManySoleCheckLabels = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input

    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const soleCheckLabels = await SoleCheckLabel.find({
      _id: { $in: req.body.ids },
    });

    if (!soleCheckLabels || soleCheckLabels.length === 0) {
      return next(new ErrorHandler("Sole check labels not found", 404));
    }

    // Perform deletion
    await SoleCheckLabel.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Sole check labels have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Error deleting sole check labels: ${error.message}`,
        500
      )
    );
  }
});
