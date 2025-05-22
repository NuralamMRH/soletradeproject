const { Payout } = require("../models/payout");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllPayouts = catchAsyncErrors(async (req, res, next) => {
  const payoutList = await Payout.find()
    .populate("user")
    .populate("payoutItems");

  if (!payoutList) {
    return next(new ErrorHandler("Payouts not found", 500));
  }

  res.status(200).json({
    success: true,
    payouts: payoutList,
  });
});

exports.getPayoutById = catchAsyncErrors(async (req, res, next) => {
  const payout = await Payout.findById(req.params.id)
    .populate("user")
    .populate("payoutItems");

  if (!payout) {
    return next(new ErrorHandler("Payout not found", 404));
  }

  res.status(200).json({
    success: true,
    payout,
  });
});

exports.createPayout = catchAsyncErrors(async (req, res, next) => {
  const payout = new Payout({
    payoutItems: req.body.payoutItems,
    totalPrice: req.body.totalPrice,
    payoutMethod: req.body.payoutMethod,
    payoutStatus: req.body.payoutStatus,
    user: req.body.user,
  });

  const savedPayout = await payout.save();

  if (!savedPayout) {
    return next(new ErrorHandler("Error creating payout", 400));
  }

  res.status(201).json({
    success: true,
    payout: savedPayout,
  });
});

exports.updatePayout = catchAsyncErrors(async (req, res, next) => {
  const updatedPayout = await Payout.findByIdAndUpdate(
    req.params.id,
    {
      payoutItems: req.body.payoutItems,
      totalPrice: req.body.totalPrice,
      payoutMethod: req.body.payoutMethod,
      payoutStatus: req.body.payoutStatus,
      user: req.body.user,
    },
    { new: true }
  );

  if (!updatedPayout) {
    return next(new ErrorHandler("Error updating payout", 400));
  }

  res.status(200).json({
    success: true,
    payout: updatedPayout,
  });
});

exports.deletePayout = catchAsyncErrors(async (req, res, next) => {
  const payout = await Payout.findByIdAndDelete(req.params.id);

  if (!payout) {
    return next(new ErrorHandler("Payout not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Payout deleted successfully",
  });
});

exports.getPayoutsByUser = catchAsyncErrors(async (req, res, next) => {
  const payouts = await Payout.find({ user: req.params.userId }).populate(
    "payoutItems"
  );

  if (!payouts) {
    return next(new ErrorHandler("Payouts not found", 500));
  }

  res.status(200).json({
    success: true,
    payouts,
  });
});
