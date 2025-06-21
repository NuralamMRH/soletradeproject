const { SoleCheckAuthService } = require("../models/SoleCheckAuthService");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllSoleCheckAuthServices = catchAsyncErrors(
  async (req, res, next) => {
    const authServiceList = await SoleCheckAuthService.find().sort({
      createdAt: -1,
    });

    if (!authServiceList) {
      return next(new ErrorHandler("Sole check auth services not found", 500));
    }

    res.status(200).json({
      success: true,
      soleCheckAuthServices: authServiceList,
    });
  }
);

exports.getSoleCheckAuthServiceById = catchAsyncErrors(
  async (req, res, next) => {
    const authService = await SoleCheckAuthService.findById(req.params.id);

    if (!authService) {
      return next(new ErrorHandler("Sole check auth service not found", 404));
    }

    res.status(200).json({
      success: true,
      soleCheckAuthService: authService,
    });
  }
);

exports.createSoleCheckAuthService = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const soleCheckAuthService = new SoleCheckAuthService({
        ...req.body,
      });

      const savedAuthService = await soleCheckAuthService.save();

      if (!savedAuthService) {
        return next(
          new ErrorHandler("Error creating sole check auth service", 400)
        );
      }

      res.status(201).json({
        success: true,
        soleCheckAuthService: savedAuthService,
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          `Error creating sole check auth service: ${error.message}`,
          500
        )
      );
    }
  }
);

exports.updateSoleCheckAuthService = catchAsyncErrors(
  async (req, res, next) => {
    const authService = await SoleCheckAuthService.findById(req.params.id);
    if (!authService) {
      return next(new ErrorHandler("Auth service not found", 404));
    }

    const updatedAuthService = await SoleCheckAuthService.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true }
    );

    if (!updatedAuthService) {
      return next(
        new ErrorHandler("Error updating sole check auth service", 400)
      );
    }

    res.status(200).json({
      success: true,
      soleCheckAuthService: updatedAuthService,
    });
  }
);

exports.deleteSoleCheckAuthService = catchAsyncErrors(
  async (req, res, next) => {
    const authService = await SoleCheckAuthService.findById(req.params.id);

    if (!authService) {
      return next(new ErrorHandler("Sole check auth service not found", 404));
    }

    await SoleCheckAuthService.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sole check auth service deleted successfully",
    });
  }
);

exports.deleteManySoleCheckAuthServices = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Validate input

      if (!req.body.ids || !Array.isArray(req.body.ids)) {
        return next(new ErrorHandler("Invalid request data", 400));
      }

      // Find the s to delete
      const soleCheckAuthServices = await SoleCheckAuthService.find({
        _id: { $in: req.body.ids },
      });

      if (!soleCheckAuthServices || soleCheckAuthServices.length === 0) {
        return next(
          new ErrorHandler("Sole check auth services not found", 404)
        );
      }

      // Perform deletion
      await SoleCheckAuthService.deleteMany({ _id: { $in: req.body.ids } });

      res.status(200).json({
        success: true,
        message: "Sole check auth services have been deleted successfully.",
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          `Error deleting sole check auth services: ${error.message}`,
          500
        )
      );
    }
  }
);
