const { SoleDraw } = require("../models/soleDraw");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllSoleDraws = catchAsyncErrors(async (req, res, next) => {
  const drawList = await SoleDraw.find()
    .populate("product")
    .populate("winner")
    .populate("participants");

  if (!drawList) {
    return next(new ErrorHandler("Sole draws not found", 500));
  }

  res.status(200).json({
    success: true,
    soleDraws: drawList,
  });
});

exports.getSoleDrawById = catchAsyncErrors(async (req, res, next) => {
  const draw = await SoleDraw.findById(req.params.id)
    .populate("product")
    .populate("winner")
    .populate("participants");

  if (!draw) {
    return next(new ErrorHandler("Sole draw not found", 404));
  }

  res.status(200).json({
    success: true,
    soleDraw: draw,
  });
});

exports.createSoleDraw = catchAsyncErrors(async (req, res, next) => {
  const draw = new SoleDraw({
    product: req.body.product,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    maxParticipants: req.body.maxParticipants,
    status: req.body.status,
    winner: req.body.winner,
    participants: req.body.participants,
  });

  const savedDraw = await draw.save();

  if (!savedDraw) {
    return next(new ErrorHandler("Error creating sole draw", 400));
  }

  res.status(201).json({
    success: true,
    soleDraw: savedDraw,
  });
});

exports.updateSoleDraw = catchAsyncErrors(async (req, res, next) => {
  const updatedDraw = await SoleDraw.findByIdAndUpdate(
    req.params.id,
    {
      product: req.body.product,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      maxParticipants: req.body.maxParticipants,
      status: req.body.status,
      winner: req.body.winner,
      participants: req.body.participants,
    },
    { new: true }
  );

  if (!updatedDraw) {
    return next(new ErrorHandler("Error updating sole draw", 400));
  }

  res.status(200).json({
    success: true,
    soleDraw: updatedDraw,
  });
});

exports.deleteSoleDraw = catchAsyncErrors(async (req, res, next) => {
  const draw = await SoleDraw.findByIdAndDelete(req.params.id);

  if (!draw) {
    return next(new ErrorHandler("Sole draw not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Sole draw deleted successfully",
  });
});

exports.getActiveSoleDraws = catchAsyncErrors(async (req, res, next) => {
  const activeDraws = await SoleDraw.find({ status: "active" })
    .populate("product")
    .populate("participants");

  if (!activeDraws) {
    return next(new ErrorHandler("Active sole draws not found", 500));
  }

  res.status(200).json({
    success: true,
    soleDraws: activeDraws,
  });
});

exports.getSoleDrawsByProduct = catchAsyncErrors(async (req, res, next) => {
  const draws = await SoleDraw.find({ product: req.params.productId })
    .populate("winner")
    .populate("participants");

  if (!draws) {
    return next(new ErrorHandler("Sole draws not found", 500));
  }

  res.status(200).json({
    success: true,
    soleDraws: draws,
  });
});

exports.getSoleDrawsByUser = catchAsyncErrors(async (req, res, next) => {
  const draws = await SoleDraw.find({
    participants: req.params.userId,
  })
    .populate("product")
    .populate("winner");

  if (!draws) {
    return next(new ErrorHandler("Sole draws not found", 500));
  }

  res.status(200).json({
    success: true,
    soleDraws: draws,
  });
});
