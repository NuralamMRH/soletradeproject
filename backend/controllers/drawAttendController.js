const { DrawAttend } = require("../models/drawAttend");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllDrawAttends = catchAsyncErrors(async (req, res, next) => {
  const attendList = await DrawAttend.find()
    .populate("user")
    .populate("product");

  if (!attendList) {
    return next(new ErrorHandler("Draw attends not found", 500));
  }

  res.status(200).json({
    success: true,
    drawAttends: attendList,
  });
});

exports.getDrawAttendById = catchAsyncErrors(async (req, res, next) => {
  const attend = await DrawAttend.findById(req.params.id)
    .populate("user")
    .populate("product");

  if (!attend) {
    return next(new ErrorHandler("Draw attend not found", 404));
  }

  res.status(200).json({
    success: true,
    drawAttend: attend,
  });
});

exports.createDrawAttend = catchAsyncErrors(async (req, res, next) => {
  const attend = new DrawAttend({
    user: req.body.user,
    product: req.body.product,
  });

  const savedAttend = await attend.save();

  if (!savedAttend) {
    return next(new ErrorHandler("Error creating draw attend", 400));
  }

  res.status(201).json({
    success: true,
    drawAttend: savedAttend,
  });
});

exports.updateDrawAttend = catchAsyncErrors(async (req, res, next) => {
  const updatedAttend = await DrawAttend.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      product: req.body.product,
    },
    { new: true }
  );

  if (!updatedAttend) {
    return next(new ErrorHandler("Error updating draw attend", 400));
  }

  res.status(200).json({
    success: true,
    drawAttend: updatedAttend,
  });
});

exports.deleteDrawAttend = catchAsyncErrors(async (req, res, next) => {
  const attend = await DrawAttend.findByIdAndDelete(req.params.id);

  if (!attend) {
    return next(new ErrorHandler("Draw attend not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Draw attend deleted successfully",
  });
});

exports.getDrawAttendsByUser = catchAsyncErrors(async (req, res, next) => {
  const attends = await DrawAttend.find({ user: req.params.userId }).populate(
    "product"
  );

  if (!attends) {
    return next(new ErrorHandler("Draw attends not found", 500));
  }

  res.status(200).json({
    success: true,
    drawAttends: attends,
  });
});

exports.getDrawAttendsByProduct = catchAsyncErrors(async (req, res, next) => {
  const attends = await DrawAttend.find({
    product: req.params.productId,
  }).populate("user");

  if (!attends) {
    return next(new ErrorHandler("Draw attends not found", 500));
  }

  res.status(200).json({
    success: true,
    drawAttends: attends,
  });
});
