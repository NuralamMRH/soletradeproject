const { SoleCheckItem } = require("../models/SoleCheckItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { filesUpdatePromises } = require("../utils/fileUploader");

exports.getAllSoleCheckItems = catchAsyncErrors(async (req, res, next) => {
  const itemList = await SoleCheckItem.find()
    .populate("soleCheckBrand")
    .populate("soleCheckModel")
    .populate("user");

  if (!itemList) {
    return next(new ErrorHandler("Sole check items not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckItems: itemList,
  });
});

exports.getSoleCheckItemById = catchAsyncErrors(async (req, res, next) => {
  const item = await SoleCheckItem.findById(req.params.id)
    .populate("soleCheckBrand")
    .populate("soleCheckModel")
    .populate("user");

  if (!item) {
    return next(new ErrorHandler("Sole check item not found", 404));
  }

  res.status(200).json({
    success: true,
    soleCheckItem: item,
  });
});

exports.createSoleCheckItem = catchAsyncErrors(async (req, res, next) => {
  const imageFields = [
    "appearanceImage",
    "insideLabelImage",
    "insoleImage",
    "insoleStitchImage",
    "boxLabelImage",
    "dateCodeImage",
    "additionalImages",
  ];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "sole-check-item"
  );

  const item = new SoleCheckItem({
    user: req.user.id,
    ...uploadedFile,
    ...req.body,
  });

  const savedItem = await item.save();

  if (!savedItem) {
    return next(new ErrorHandler("Error creating sole check item", 400));
  }

  res.status(201).json({
    success: true,
    soleCheckItem: savedItem,
  });
});

exports.updateSoleCheckItem = catchAsyncErrors(async (req, res, next) => {
  const imageFields = [
    "appearanceImage",
    "insideLabelImage",
    "insoleImage",
    "insoleStitchImage",
    "boxLabelImage",
    "dateCodeImage",
    "additionalImages",
  ];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "sole-check-item"
  );

  const updatedItem = await SoleCheckItem.findByIdAndUpdate(
    req.params.id,
    {
      ...uploadedFile,
      ...req.body,
      user: req.user.id,
      notes: req.body.notes,
    },
    { new: true }
  );

  if (!updatedItem) {
    return next(new ErrorHandler("Error updating sole check item", 400));
  }

  res.status(200).json({
    success: true,
    soleCheckItem: updatedItem,
  });
});

exports.deleteSoleCheckItem = catchAsyncErrors(async (req, res, next) => {
  const item = await SoleCheckItem.findByIdAndDelete(req.params.id);

  if (!item) {
    return next(new ErrorHandler("Sole check item not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Sole check item deleted successfully",
  });
});

exports.getSoleCheckItemsByUser = catchAsyncErrors(async (req, res, next) => {
  const items = await SoleCheckItem.find({ user: req.user.id })
    .populate("soleCheckBrand")
    .populate("soleCheckModel")
    .populate("user");

  if (!items) {
    return next(new ErrorHandler("Sole check items not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckItems: items,
  });
});

exports.getSoleCheckItemsByBrand = catchAsyncErrors(async (req, res, next) => {
  const items = await SoleCheckItem.find({ soleCheckBrand: req.params.brandId })
    .populate("soleCheckBrand")
    .populate("soleCheckModel")
    .populate("user");

  if (!items) {
    return next(new ErrorHandler("Sole check items not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckItems: items,
  });
});
