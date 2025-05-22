const { PortfolioItem } = require("../models/portfolioItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllPortfolioItems = catchAsyncErrors(async (req, res, next) => {
  const portfolioList = await PortfolioItem.find()
    .populate("user")
    .populate("product")
    .populate("size");

  if (!portfolioList) {
    return next(new ErrorHandler("Portfolio items not found", 500));
  }

  res.status(200).json({
    success: true,
    portfolioItems: portfolioList,
  });
});

exports.getPortfolioItemById = catchAsyncErrors(async (req, res, next) => {
  const portfolioItem = await PortfolioItem.findById(req.params.id)
    .populate("user")
    .populate("product")
    .populate("size");

  if (!portfolioItem) {
    return next(new ErrorHandler("Portfolio item not found", 404));
  }

  res.status(200).json({
    success: true,
    portfolioItem,
  });
});

exports.createPortfolioItem = catchAsyncErrors(async (req, res, next) => {
  const portfolioItem = new PortfolioItem({
    user: req.body.user,
    product: req.body.product,
    size: req.body.size,
    itemCondition: req.body.itemCondition,
    purchasePrice: req.body.purchasePrice,
    purchaseAt: req.body.purchaseAt,
  });

  const savedPortfolioItem = await portfolioItem.save();

  if (!savedPortfolioItem) {
    return next(new ErrorHandler("Error creating portfolio item", 400));
  }

  res.status(201).json({
    success: true,
    portfolioItem: savedPortfolioItem,
  });
});

exports.updatePortfolioItem = catchAsyncErrors(async (req, res, next) => {
  const updatedPortfolioItem = await PortfolioItem.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      product: req.body.product,
      size: req.body.size,
      itemCondition: req.body.itemCondition,
      purchasePrice: req.body.purchasePrice,
      purchaseAt: req.body.purchaseAt,
    },
    { new: true }
  );

  if (!updatedPortfolioItem) {
    return next(new ErrorHandler("Error updating portfolio item", 400));
  }

  res.status(200).json({
    success: true,
    portfolioItem: updatedPortfolioItem,
  });
});

exports.deletePortfolioItem = catchAsyncErrors(async (req, res, next) => {
  const portfolioItem = await PortfolioItem.findByIdAndDelete(req.params.id);

  if (!portfolioItem) {
    return next(new ErrorHandler("Portfolio item not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Portfolio item deleted successfully",
  });
});

exports.getPortfolioItemsByUser = catchAsyncErrors(async (req, res, next) => {
  const portfolioItems = await PortfolioItem.find({ user: req.params.userId })
    .populate("product")
    .populate("size");

  if (!portfolioItems) {
    return next(new ErrorHandler("Portfolio items not found", 500));
  }

  res.status(200).json({
    success: true,
    portfolioItems,
  });
});
