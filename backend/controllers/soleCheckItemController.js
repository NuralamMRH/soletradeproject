const { SoleCheckItem } = require("../models/SoleCheckItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { filesUpdatePromises } = require("../utils/fileUploader");

exports.getAllSoleCheckItems = catchAsyncErrors(async (req, res, next) => {
  const itemList = await SoleCheckItem.find()
    .populate("brand")
    .populate("model")
    .populate("category")
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
    .populate("brand")
    .populate("model")
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
  console.log("req.body", req.body);
  const fileFieldsToUpload = ["images"];
  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    fileFieldsToUpload,
    "sole-check-item"
  );

  const sellingItem = new SoleCheckItem({
    userId: req.user.id,
    ...req.body,

    ...uploadedFile,
  });

  const savedItem = await sellingItem.save();

  if (!savedItem) {
    return next(new ErrorHandler("Error creating sole check item", 400));
  }

  res.status(201).json({
    success: true,
    soleCheckItem: savedItem,
  });
});

exports.updateSoleCheckItem = catchAsyncErrors(async (req, res, next) => {
  const fileFieldsToUpload = ["images"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    fileFieldsToUpload,
    "sole-check-item"
  );

  const updatedItem = await SoleCheckItem.findByIdAndUpdate(
    req.params.id,
    {
      ...uploadedFile,
      ...req.body,
      userId: req.user.id,
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

exports.updateSoleCheckItemStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const updatedItem = await SoleCheckItem.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        comment: req.body.comment,
      },
      { new: true }
    );

    if (!updatedItem) {
      return next(
        new ErrorHandler("Error updating sole check item status", 400)
      );
    }

    res.status(200).json({
      success: true,
      soleCheckItem: updatedItem,
    });
  } catch (error) {
    return next(new ErrorHandler("Error updating sole check item status", 400));
  }
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
    .populate("brand")
    .populate("model")
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
  const items = await SoleCheckItem.find({ brand: req.params.brandId })
    .populate("brand")
    .populate("model")
    .populate("user");

  if (!items) {
    return next(new ErrorHandler("Sole check items not found", 500));
  }

  res.status(200).json({
    success: true,
    soleCheckItems: items,
  });
});
