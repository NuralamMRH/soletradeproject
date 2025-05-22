const { CalenderNotify } = require("../models/calenderNotify");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllCalenderNotifies = catchAsyncErrors(async (req, res, next) => {
  const notifyList = await CalenderNotify.find()
    .populate("user")
    .populate("product");

  if (!notifyList) {
    return next(new ErrorHandler("Calender notifies not found", 500));
  }

  res.status(200).json({
    success: true,
    calenderNotifies: notifyList,
  });
});

exports.getCalenderNotifyById = catchAsyncErrors(async (req, res, next) => {
  const notify = await CalenderNotify.findById(req.params.id)
    .populate("user")
    .populate("product");

  if (!notify) {
    return next(new ErrorHandler("Calender notify not found", 404));
  }

  res.status(200).json({
    success: true,
    calenderNotify: notify,
  });
});

exports.createCalenderNotify = catchAsyncErrors(async (req, res, next) => {
  const notify = new CalenderNotify({
    user: req.body.user,
    product: req.body.product,
  });

  const savedNotify = await notify.save();

  if (!savedNotify) {
    return next(new ErrorHandler("Error creating calender notify", 400));
  }

  res.status(201).json({
    success: true,
    calenderNotify: savedNotify,
  });
});

exports.updateCalenderNotify = catchAsyncErrors(async (req, res, next) => {
  const updatedNotify = await CalenderNotify.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      product: req.body.product,
    },
    { new: true }
  );

  if (!updatedNotify) {
    return next(new ErrorHandler("Error updating calender notify", 400));
  }

  res.status(200).json({
    success: true,
    calenderNotify: updatedNotify,
  });
});

exports.deleteCalenderNotify = catchAsyncErrors(async (req, res, next) => {
  const notify = await CalenderNotify.findByIdAndDelete(req.params.id);

  if (!notify) {
    return next(new ErrorHandler("Calender notify not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Calender notify deleted successfully",
  });
});

exports.getCalenderNotifiesByUser = catchAsyncErrors(async (req, res, next) => {
  const notifies = await CalenderNotify.find({
    user: req.params.userId,
  }).populate("product");

  if (!notifies) {
    return next(new ErrorHandler("Calender notifies not found", 500));
  }

  res.status(200).json({
    success: true,
    calenderNotifies: notifies,
  });
});
