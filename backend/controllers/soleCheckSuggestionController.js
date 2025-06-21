const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { SoleCheckSuggestion } = require("../models/soleCheckSuggestion");

exports.getAllSoleCheckSuggestions = catchAsyncErrors(
  async (req, res, next) => {
    const soleCheckSuggestionsList = await SoleCheckSuggestion.find();

    if (!soleCheckSuggestionsList) {
      return next(new ErrorHandler("Sole check suggestions not found", 500));
    }

    res.status(200).json({
      success: true,
      soleCheckSuggestions: soleCheckSuggestionsList,
    });
  }
);

exports.getSoleCheckSuggestionById = catchAsyncErrors(
  async (req, res, next) => {
    const soleCheckSuggestion = await SoleCheckSuggestion.findById(
      req.params.id
    );

    if (!soleCheckSuggestion) {
      return next(new ErrorHandler("Sole check suggestion not found", 404));
    }

    res.status(200).json({
      success: true,
      soleCheckSuggestion: soleCheckSuggestion,
    });
  }
);

exports.createSoleCheckSuggestion = catchAsyncErrors(async (req, res, next) => {
  const soleCheckSuggestion = new SoleCheckSuggestion({
    ...req.body,
  });

  const savedSoleCheckSuggestion = await soleCheckSuggestion.save();

  if (!savedSoleCheckSuggestion) {
    return next(new ErrorHandler("Error creating sole check suggestion", 400));
  }

  res.status(201).json({
    success: true,
    soleCheckSuggestion: savedSoleCheckSuggestion,
  });
});

exports.updateSoleCheckSuggestion = catchAsyncErrors(async (req, res, next) => {
  const soleCheckSuggestion = await SoleCheckSuggestion.findById(req.params.id);
  if (!soleCheckSuggestion) {
    return next(new ErrorHandler("Sole check suggestion not found", 404));
  }

  const updatedSoleCheckSuggestion =
    await soleCheckSuggestion.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

  if (!updatedSoleCheckSuggestion) {
    return next(new ErrorHandler("Error updating sole check suggestion", 400));
  }

  res.status(200).json({
    success: true,
    soleCheckSuggestion: updatedSoleCheckSuggestion,
  });
});

exports.deleteSoleCheckSuggestion = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("req.params.id", req.params.id);

    const soleCheckSuggestion = await SoleCheckSuggestion.findById(
      req.params.id
    );

    if (!soleCheckSuggestion) {
      return next(new ErrorHandler("Sole check suggestion not found", 404));
    }

    await SoleCheckSuggestion.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sole check suggestion deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting sole check suggestion", error.message);
    return next(new ErrorHandler("Error deleting sole check suggestion", 400));
  }
});

exports.deleteManySoleCheckSuggestions = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Validate input

      if (!req.body.ids || !Array.isArray(req.body.ids)) {
        return next(new ErrorHandler("Invalid request data", 400));
      }

      // Find the s to delete
      const soleCheckSuggestions = await SoleCheckSuggestion.find({
        _id: { $in: req.body.ids },
      });

      if (!soleCheckSuggestions || soleCheckSuggestions.length === 0) {
        return next(new ErrorHandler("Sole check suggestions not found", 404));
      }

      // Perform deletion
      await soleCheckSuggestions.deleteMany({ _id: { $in: req.body.ids } });

      res.status(200).json({
        success: true,
        message: "Sole check suggestions have been deleted successfully.",
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          `Error deleting sole check suggestions: ${error.message}`,
          500
        )
      );
    }
  }
);
