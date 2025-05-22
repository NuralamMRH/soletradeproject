const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { Wishlist } = require("../models/wishlist");

// Get all wishlists for current user
exports.getAllWishlists = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const wishlistList = await Wishlist.find({ user: req.user._id })
    .populate("user")
    .populate("product")
    .sort({ dateCreated: -1 });

  res.status(200).json({
    success: true,
    wishlists: wishlistList,
  });
});

// Get wishlist by ID
exports.getWishlistById = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await Wishlist.findById(req.params.id)
    .populate("user")
    .populate("product");

  if (!wishlist) {
    return next(new ErrorHandler("Wishlist not found", 404));
  }

  res.status(200).json({
    success: true,
    wishlist,
  });
});

// Create new wishlist
exports.createWishlist = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  // Check if product is already in user's wishlist
  const existingWishlist = await Wishlist.findOne({
    user: req.user._id,
    product: req.body.product,
  });

  if (existingWishlist) {
    return next(new ErrorHandler("Product already in wishlist", 400));
  }

  const wishlist = new Wishlist({
    user: req.user._id,
    product: req.body.product,
  });

  const savedWishlist = await wishlist.save();

  res.status(201).json({
    success: true,
    wishlist: savedWishlist,
  });
});

// Delete wishlist
exports.deleteWishlist = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const wishlist = await Wishlist.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!wishlist) {
    return next(new ErrorHandler("Wishlist not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Wishlist deleted successfully",
  });
});

// Get wishlist by product ID
exports.getWishlistByProduct = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const wishlist = await Wishlist.findOne({
    product: req.params.productId,
    user: req.user._id,
  }).populate("product");

  res.status(200).json({
    success: true,
    wishlist: wishlist || null,
  });
});

// Toggle wishlist status
exports.toggleWishlist = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  console.log(req.body);

  const { productId } = req.body;

  // Check if product is already in wishlist
  const existingWishlist = await Wishlist.findOne({
    user: req.user._id,
    product: productId,
  });

  if (existingWishlist) {
    // Remove from wishlist
    await Wishlist.findByIdAndDelete(existingWishlist._id);
    res.status(200).json({
      success: true,
      action: "removed",
      message: "Product removed from wishlist",
    });
  } else {
    // Add to wishlist
    const wishlist = new Wishlist({
      user: req.user._id,
      product: productId,
    });

    const savedWishlist = await wishlist.save();
    res.status(201).json({
      success: true,
      action: "added",
      wishlist: savedWishlist,
    });
  }
});

exports.updateWishlist = catchAsyncErrors(async (req, res, next) => {
  const updatedWishlist = await Wishlist.findByIdAndUpdate(
    req.params.id,
    {
      user: req.user.id,
      product: req.body.product,
    },
    { new: true }
  );

  if (!updatedWishlist) {
    return next(new ErrorHandler("Error updating wishlist", 400));
  }

  res.status(200).json({
    success: true,
    wishlist: updatedWishlist,
  });
});

exports.getWishlistByUser = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await Wishlist.find({ user: req.params.userId }).populate(
    "product"
  );

  if (!wishlist) {
    return next(new ErrorHandler("Wishlist not found", 500));
  }

  res.status(200).json({
    success: true,
    wishlist,
  });
});
