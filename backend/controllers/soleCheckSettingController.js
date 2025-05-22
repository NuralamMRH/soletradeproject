const SoleCheckSetting = require("../models/soleCheckSetting");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Get all settings
exports.getSettings = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOne()
    .populate("imageRequirements.category")
    .populate("imageRequirements.brand")
    .populate("imageRequirements.model")
    .populate("authServices.category");

  res.status(200).json({
    success: true,
    settings,
  });
});

// Image Requirements Controllers
exports.getImageRequirements = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOne()
    .populate("imageRequirements.category")
    .populate("imageRequirements.brand")
    .populate("imageRequirements.model");

  res.status(200).json({
    success: true,
    imageRequirements: settings?.imageRequirements || [],
  });
});

exports.addImageRequirement = catchAsyncErrors(async (req, res, next) => {
  let settings = await SoleCheckSetting.findOne();

  if (!settings) {
    settings = new SoleCheckSetting();
  }

  settings.imageRequirements.push(req.body);
  await settings.save();

  res.status(201).json({
    success: true,
    imageRequirement:
      settings.imageRequirements[settings.imageRequirements.length - 1],
  });
});

exports.updateImageRequirement = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOneAndUpdate(
    { "imageRequirements._id": req.params.id },
    { $set: { "imageRequirements.$": req.body } },
    { new: true }
  );

  if (!settings) {
    return next(new ErrorHandler("Image requirement not found", 404));
  }

  res.status(200).json({
    success: true,
    imageRequirement: settings.imageRequirements.id(req.params.id),
  });
});

exports.deleteImageRequirement = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOneAndUpdate(
    {},
    { $pull: { imageRequirements: { _id: req.params.id } } },
    { new: true }
  );

  if (!settings) {
    return next(new ErrorHandler("Image requirement not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Image requirement deleted successfully",
  });
});

// Auth Service Controllers
exports.getAuthServices = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOne().populate(
    "authServices.category"
  );

  res.status(200).json({
    success: true,
    authServices: settings?.authServices || [],
  });
});

exports.addAuthService = catchAsyncErrors(async (req, res, next) => {
  let settings = await SoleCheckSetting.findOne();

  if (!settings) {
    settings = new SoleCheckSetting();
  }

  settings.authServices.push(req.body);
  await settings.save();

  res.status(201).json({
    success: true,
    authService: settings.authServices[settings.authServices.length - 1],
  });
});

exports.updateAuthService = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOneAndUpdate(
    { "authServices._id": req.params.id },
    { $set: { "authServices.$": req.body } },
    { new: true }
  );

  if (!settings) {
    return next(new ErrorHandler("Auth service not found", 404));
  }

  res.status(200).json({
    success: true,
    authService: settings.authServices.id(req.params.id),
  });
});

exports.deleteAuthService = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOneAndUpdate(
    {},
    { $pull: { authServices: { _id: req.params.id } } },
    { new: true }
  );

  if (!settings) {
    return next(new ErrorHandler("Auth service not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Auth service deleted successfully",
  });
});

// Topup Package Controllers
exports.getTopupPackages = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOne();

  res.status(200).json({
    success: true,
    topupPackages: settings?.topupPackages || [],
  });
});

exports.addTopupPackage = catchAsyncErrors(async (req, res, next) => {
  let settings = await SoleCheckSetting.findOne();

  if (!settings) {
    settings = new SoleCheckSetting();
  }

  settings.topupPackages.push(req.body);
  await settings.save();

  res.status(201).json({
    success: true,
    topupPackage: settings.topupPackages[settings.topupPackages.length - 1],
  });
});

exports.updateTopupPackage = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOneAndUpdate(
    { "topupPackages._id": req.params.id },
    { $set: { "topupPackages.$": req.body } },
    { new: true }
  );

  if (!settings) {
    return next(new ErrorHandler("Topup package not found", 404));
  }

  res.status(200).json({
    success: true,
    topupPackage: settings.topupPackages.id(req.params.id),
  });
});

exports.deleteTopupPackage = catchAsyncErrors(async (req, res, next) => {
  const settings = await SoleCheckSetting.findOneAndUpdate(
    {},
    { $pull: { topupPackages: { _id: req.params.id } } },
    { new: true }
  );

  if (!settings) {
    return next(new ErrorHandler("Topup package not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Topup package deleted successfully",
  });
});
