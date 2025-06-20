const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { RecentViewed } = require("../../models/RecentViewed");
const { Product } = require("../../models/product");

// Get all recent viewed items for current user
exports.getAllRecentViewedItems = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const recentViewedItems = await RecentViewed.find({
    userId: req.user.id,
  }).sort({ lastViewedAt: -1 });

  const products = await Product.find({
    _id: { $in: recentViewedItems.map((item) => item.productId) },
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
    recentViewedItems: recentViewedItems,
    products: products,
  });
});

// Get search item by ID
exports.getRecentViewedItemById = catchAsyncErrors(async (req, res, next) => {
  const recentViewedItem = await RecentViewed.findById(req.params.id).populate(
    "user"
  );

  if (!recentViewedItem) {
    return next(new ErrorHandler("Recent viewed item not found", 404));
  }

  res.status(200).json({
    success: true,
    recentViewedItem,
  });
});

// Delete recent viewed item
exports.deleteRecentViewedItem = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const recentViewedItem = await RecentViewed.findByIdAndDelete(req.params.id);

  if (!recentViewedItem) {
    return next(new ErrorHandler("Recent viewed item not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Search item deleted successfully",
  });
});

// Delete many recent viewed items
exports.deleteManyRecentViewedItems = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Validate input
      if (!req.body.ids || !Array.isArray(req.body.ids)) {
        return next(new ErrorHandler("Invalid request data", 400));
      }

      // Find the s to delete
      const recentViewedItems = await RecentViewed.find({
        _id: { $in: req.body.ids },
      });
      if (!recentViewedItems || recentViewedItems.length === 0) {
        return next(new ErrorHandler("Recent viewed items not found", 404));
      }

      // Perform deletion
      await RecentViewed.deleteMany({ _id: { $in: req.body.ids } });

      res.status(200).json({
        success: true,
        message: "Search items have been deleted successfully.",
      });
    } catch (error) {
      return next(
        new ErrorHandler(
          `Error deleting recent viewed items: ${error.message}`,
          500
        )
      );
    }
  }
);
