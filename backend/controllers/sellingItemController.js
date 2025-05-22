const { SellingItem } = require("../models/sellingItem");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  uploadMultipleFiles,
  filesUpdatePromises,
} = require("../utils/fileUploader");

// Get all selling items
exports.getAllSellingItems = catchAsyncErrors(async (req, res, next) => {
  const sellingList = await SellingItem.find()
    .populate({ path: "sellerId", select: "-passwordHash" })
    .populate({ path: "buyerId", select: "-passwordHash" })
    .populate({ path: "productId", select: "-description -variations -images" })
    .populate({
      path: "bidderOffer",
      select: "-passwordHash",
      populate: {
        path: "shippingLocation",
      },
    })
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ sellingAt: -1 });

  if (!sellingList) {
    return next(new ErrorHandler("Selling items not found", 500));
  }

  res.status(200).json({
    success: true,
    sellingItems: sellingList,
  });
});

// Get selling item by ID
exports.getSellingItemById = catchAsyncErrors(async (req, res, next) => {
  const sellingItem = await SellingItem.findById(req.params.id)
    .populate({ path: "sellerId", select: "-passwordHash" })
    .populate({ path: "buyerId", select: "-passwordHash" })
    .populate({ path: "productId", select: "-description -variations -images" })
    .populate({
      path: "bidderOffer",
      select: "-passwordHash",
      populate: {
        path: "shippingLocation",
      },
    })
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    });

  if (!sellingItem) {
    return next(new ErrorHandler("Selling item not found", 404));
  }

  res.status(200).json({
    success: true,
    sellingItem,
  });
});

// Get total sales count
exports.getTotalSalesCount = catchAsyncErrors(async (req, res, next) => {
  const totalSales = await SellingItem.countDocuments();

  if (!totalSales) {
    return next(new ErrorHandler("Error getting sales count", 500));
  }

  res.status(200).json({
    success: true,
    totalSales,
  });
});

// Get user's selling items
exports.getUserSellingItems = catchAsyncErrors(async (req, res, next) => {
  const userSellingItems = await SellingItem.find({
    sellerId: req.user.id,
  })
    .populate({ path: "sellerId", select: "-passwordHash" })
    .populate({ path: "buyerId", select: "-passwordHash" })
    .populate({ path: "productId", select: "-description -variations -images" })
    .populate({
      path: "bidderOffer",
      select: "-passwordHash",
      populate: {
        path: "shippingLocation",
      },
    })
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ validUntil: -1 });

  if (!userSellingItems) {
    return next(new ErrorHandler("User selling items not found", 500));
  }

  res.status(200).json({
    success: true,
    sellingItems: userSellingItems,
  });
});

// Get product offers
exports.getProductOffers = catchAsyncErrors(async (req, res, next) => {
  const offersInProduct = await SellingItem.find({
    productId: req.params.productId,
  })
    .populate({ path: "sellerId", select: "-passwordHash" })
    .populate({ path: "buyerId", select: "-passwordHash" })
    .populate({ path: "productId", select: "-description -variations -images" })
    .populate({
      path: "bidderOffer",
      select: "-passwordHash",
      populate: {
        path: "shippingLocation",
      },
    })
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ validUntil: -1 });

  if (!offersInProduct) {
    return next(new ErrorHandler("Product offers not found", 500));
  }

  res.status(200).json({
    success: true,
    offers: offersInProduct,
  });
});

// Get offers by product and attribute
exports.getOffersByProductAndAttribute = catchAsyncErrors(
  async (req, res, next) => {
    const offersInProduct = await SellingItem.find({
      productId: req.params.productId,
      selectedAttributeId: req.params.selectedAttributeId,
    })
      .populate({ path: "sellerId", select: "-passwordHash" })
      .populate({ path: "buyerId", select: "-passwordHash" })
      .populate({
        path: "productId",
        select: "-description -variations -images",
      })
      .populate({
        path: "bidderOffer",
        select: "-passwordHash",
        populate: {
          path: "shippingLocation",
        },
      })
      .populate({
        path: "selectedAttributeId",
        select: "optionName",
        populate: {
          path: "attributeId",
          select: "name",
        },
      })
      .sort({ validUntil: -1 });

    if (!offersInProduct) {
      return next(new ErrorHandler("Offers not found", 500));
    }

    res.status(200).json({
      success: true,
      offers: offersInProduct,
    });
  }
);

// Create new selling item
exports.createSellingItem = catchAsyncErrors(async (req, res, next) => {
  try {
    const fileFieldsToUpload = ["images"];
    const uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      fileFieldsToUpload,
      "selling"
    );

    const sellingItem = new SellingItem({
      ...req.body,
      ...uploadedFile,
    });

    const savedSellingItem = await sellingItem.save();

    if (!savedSellingItem) {
      return next(new ErrorHandler("Error creating selling item", 400));
    }

    res.status(201).json({
      success: true,
      sellingItem: savedSellingItem,
    });
  } catch (error) {
    next(error);
  }
});

// Update selling item
exports.updateSellingItem = catchAsyncErrors(async (req, res, next) => {
  try {
    const existingSellingItem = await SellingItem.findById(req.params.id);
    if (!existingSellingItem) {
      return next(new ErrorHandler("Selling item not found", 404));
    }
    const fileFieldsToUpload = ["images"];
    const uploadedFile = await filesUpdateWithExisting(
      req,
      res,
      next,
      fileFieldsToUpload,
      "selling",
      existingSellingItem
    );

    const sellingItem = await SellingItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...uploadedFile,
      },
      { new: true }
    );

    if (!sellingItem) {
      return next(new ErrorHandler("Error updating selling item", 400));
    }

    res.status(200).json({
      success: true,
      sellingItem,
    });
  } catch (error) {
    next(error);
  }
});

exports.deleteSellingItem = catchAsyncErrors(async (req, res, next) => {
  const sellingItem = await SellingItem.findById(req.params.id);
  if (!sellingItem) {
    return next(new ErrorHandler("Selling item not found", 404));
  }

  const fileFieldsToDelete = ["images"];

  // Delete all associated files using the new function
  await deleteFilesByFields(sellingItem, fileFieldsToDelete);

  await sellingItem.deleteOne();

  if (!sellingItem) {
    return next(new ErrorHandler("Selling item not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Selling item deleted successfully",
  });
});

exports.getSellingItemsByUser = catchAsyncErrors(async (req, res, next) => {
  const sellingItems = await SellingItem.find({ user: req.user.id })
    .populate("product")
    .populate("size");

  if (!sellingItems) {
    return next(new ErrorHandler("Selling items not found", 500));
  }

  res.status(200).json({
    success: true,
    sellingItems,
  });
});

exports.getSellingItemsByProduct = catchAsyncErrors(async (req, res, next) => {
  const sellingItems = await SellingItem.find({
    product: req.params.productId,
  })
    .populate("user")
    .populate("size");

  if (!sellingItems) {
    return next(new ErrorHandler("Selling items not found", 500));
  }

  res.status(200).json({
    success: true,
    sellingItems,
  });
});
