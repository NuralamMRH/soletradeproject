const { PortfolioItem } = require("../models/portfolioItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { Product } = require("../models/product");

exports.getAllPortfolioItems = catchAsyncErrors(async (req, res, next) => {
  const portfolioItems = await PortfolioItem.find()
    .populate("product")
    .populate("size");

  if (!portfolioItems) {
    return next(new ErrorHandler("Portfolio items not found", 500));
  }

  const products = await Product.find({
    _id: { $in: portfolioItems.map((item) => item.productId) },
  })
    .populate("category")
    .populate("brand")
    .populate("indicator")
    .populate("attribute")
    .populate("bidding")
    .populate("selling")
    .populate("transactions")
    .populate("wishlist")
    .populate({
      path: "variations",
      populate: {
        path: "attributeId",
      },
    });

  res.status(200).json({
    success: true,
    portfolioItems,
    products,
  });
});

exports.getPortfolioItemsByUser = catchAsyncErrors(async (req, res, next) => {
  const portfolioItems = await PortfolioItem.find({ user: req.params.userId })
    .populate("product")
    .populate("size");

  if (!portfolioItems) {
    return next(new ErrorHandler("Portfolio items not found", 500));
  }

  const products = await Product.find({
    _id: { $in: portfolioItems.map((item) => item.productId) },
  })
    .populate("category")
    .populate("brand")
    .populate("indicator")
    .populate("attribute")
    .populate("bidding")
    .populate("selling")
    .populate("transactions")
    .populate("wishlist")
    .populate({
      path: "variations",
      populate: {
        path: "attributeId",
      },
    });

  res.status(200).json({
    success: true,
    portfolioItems,
    products,
  });
});

exports.getPortfolioItemById = catchAsyncErrors(async (req, res, next) => {
  const portfolio = await PortfolioItem.findById(req.params.id).populate({
    path: "size",
    populate: {
      path: "attributeId",
    },
  });

  if (!portfolio) {
    return next(new ErrorHandler("Portfolio item not found", 404));
  }

  const product = await Product.findById(portfolio.productId)
    .populate("category")
    .populate("brand")
    .populate("indicator")
    .populate("attribute")
    .populate("bidding")
    .populate("selling")
    .populate("transactions")
    .populate("wishlist")
    .populate({
      path: "variations",
      populate: {
        path: "attributeId",
      },
    });

  res.status(200).json({
    success: true,
    portfolio,
    product,
  });
});

exports.createPortfolioItem = catchAsyncErrors(async (req, res, next) => {
  const portfolioItem = new PortfolioItem({
    ...req.body,
    userId: req.user.id,
  });

  if (
    await PortfolioItem.findOne({
      productId: req.body.productId,
      sizeId: req.body.sizeId,
      userId: req.user.id,
    })
  ) {
    return next(new ErrorHandler("Product already in portfolio", 400));
  }

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
  try {
    const updatedPortfolioItem = await PortfolioItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        userId: req.user.id,
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
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Error updating portfolio item", 400));
  }
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

exports.deleteManyPortfolioItems = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input

    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const portfolioItems = await PortfolioItem.find({
      _id: { $in: req.body.ids },
    });

    if (!portfolioItems || portfolioItems.length === 0) {
      return next(new ErrorHandler("Portfolio items not found", 404));
    }

    // Perform deletion
    await PortfolioItem.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Portfolio items have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting portfolio items: ${error.message}`, 500)
    );
  }
});
