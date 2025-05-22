const { User } = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.updateExpoPushToken = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      expoPushToken: req.body.expoPushToken,
    },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getExpoPushToken = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("expoPushToken");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    expoPushToken: user.expoPushToken,
  });
});
