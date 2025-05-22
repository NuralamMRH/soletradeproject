// middleware/localization.js
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// Localization Middleware
exports.setLocalization = catchAsyncErrors(async (req, res, next) => {
  const language = req.headers["x-localization"];

  if (!language) {
    return next(new ErrorHandler("Localization header missing", 400));
  }

  req.language = language; // Set language on request object for further use

  next();
});
