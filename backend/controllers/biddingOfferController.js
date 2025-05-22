const { BiddingOffer } = require("../models/biddingOffer");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllBiddingOffers = catchAsyncErrors(async (req, res, next) => {
  // Base query
  let query = BiddingOffer.find()
    .populate({
      path: "productId",
      select: "name richDescription image",
    })
    .populate({
      path: "sellerOffer",
      select: "-bidderOffer -productId",
    })
    .populate({
      path: "user",
      select: "-password",
    })
    .populate("shippingLocation")
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ validUntil: -1 });

  // Apply APIFeatures for search, filter, and pagination
  const apiFeatures = new APIFeatures(query, req.query);
  await apiFeatures.search();
  await apiFeatures.filter();
  const result = await apiFeatures.execute();

  res.status(200).json({
    success: true,
    count: result.data.length,
    filteredCount: result.filteredCount,
    resPerPage: result.resPerPage,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
    bids: result.data,
  });
});

exports.getBiddingOfferById = catchAsyncErrors(async (req, res, next) => {
  const biddingOffer = await BiddingOffer.findById(req.params.id)
    .populate({
      path: "productId",
      select: "name richDescription image",
    })
    .populate({
      path: "sellerOffer",
      select: "-bidderOffer -productId",
    })
    .populate({
      path: "user",
      select: "-passwordHash",
    })
    .populate("shippingLocation")
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    });

  if (!biddingOffer) {
    return next(new ErrorHandler("Bidding offer not found", 404));
  }

  res.status(200).json({
    success: true,
    biddingOffer,
  });
});

exports.createBiddingOffer = catchAsyncErrors(async (req, res, next) => {
  const biddingOffer = new BiddingOffer({
    user: req.user.id,
    biddingType: req.body.biddingType,
    biddingStatus: req.body.biddingStatus,
    productId: req.body.productId,
    sellerOffer: req.body.sellerOffer,
    itemCondition: req.body.itemCondition,
    packaging: req.body.packaging,
    selectedAttributeId: req.body.selectedAttributeId,
    offeredPrice: req.body.offeredPrice,
    totalPrice: req.body.totalPrice,
    offerCreateDate: req.body.offerCreateDate,
    validUntil: req.body.validUntil,
    paymentMethod: req.body.paymentMethod,
    paymentStatus: req.body.paymentStatus,
    paymentDate: req.body.paymentDate,
    shippingStatus: req.body.shippingStatus,
    shippingLocation: req.body.shippingLocation,
  });

  const savedBiddingOffer = await biddingOffer.save();
  if (!savedBiddingOffer) {
    return next(new ErrorHandler("Error creating bidding offer", 500));
  }

  res.status(201).json({
    success: true,
    biddingOffer: savedBiddingOffer,
  });
});

exports.updateBiddingOffer = catchAsyncErrors(async (req, res, next) => {
  const biddingOffer = await BiddingOffer.findByIdAndUpdate(
    req.params.id,
    {
      biddingType: req.body.biddingType,
      biddingStatus: req.body.biddingStatus,
      offeredPrice: req.body.offeredPrice,
      totalPrice: req.body.totalPrice,
      paymentStatus: req.body.paymentStatus,
      validUntil: req.body.validUntil,
      shippingStatus: req.body.shippingStatus,
    },
    { new: true }
  );

  if (!biddingOffer) {
    return next(new ErrorHandler("Bidding offer not found", 404));
  }

  res.status(200).json({
    success: true,
    biddingOffer,
  });
});

exports.deleteBiddingOffer = catchAsyncErrors(async (req, res, next) => {
  const biddingOffer = await BiddingOffer.findByIdAndDelete(req.params.id);

  if (!biddingOffer) {
    return next(new ErrorHandler("Bidding offer not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Bidding offer deleted successfully",
  });
});

exports.getBiddingOfferCount = catchAsyncErrors(async (req, res, next) => {
  const totalBids = await BiddingOffer.countDocuments();

  if (!totalBids) {
    return next(new ErrorHandler("Error getting bidding offer count", 500));
  }

  res.status(200).json({
    success: true,
    totalBids,
  });
});

exports.getUserBiddingOffers = catchAsyncErrors(async (req, res, next) => {
  const userOfferList = await BiddingOffer.find({ user: req.user.id })
    .populate({
      path: "productId",
      select: "name richDescription image",
    })
    .populate({
      path: "sellerOffer",
      select: "-bidderOffer -productId",
    })
    .populate({
      path: "user",
      select: "-passwordHash",
    })
    .populate("shippingLocation")
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ validUntil: -1 });

  if (!userOfferList) {
    return next(new ErrorHandler("No bidding offers found for this user", 404));
  }

  res.status(200).json({
    success: true,
    biddingOffers: userOfferList,
  });
});

exports.getProductBiddingOffers = catchAsyncErrors(async (req, res, next) => {
  const productOfferList = await BiddingOffer.find({
    productId: req.params.productId,
  })
    .populate({
      path: "sellerOffer",
      select: "-bidderOffer -productId",
    })
    .populate({
      path: "user",
      select: "-passwordHash",
    })
    .populate("shippingLocation")
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ validUntil: -1 });

  if (!productOfferList) {
    return next(
      new ErrorHandler("No bidding offers found for this product", 404)
    );
  }

  res.status(200).json({
    success: true,
    biddingOffers: productOfferList,
  });
});

exports.getProductBiddingOffersByAttribute = catchAsyncErrors(
  async (req, res, next) => {
    const { productId, selectedAttributeId } = req.params;

    const productOfferList = await BiddingOffer.find({
      productId,
      selectedAttributeId,
    })
      .populate("user", "name")
      .populate("productId", "name")
      .populate({
        path: "selectedAttributeId",
        select: "optionName",
        populate: {
          path: "attributeId",
          select: "name",
        },
      })
      .sort({ validUntil: -1 });

    if (!productOfferList) {
      return next(
        new ErrorHandler(
          "No bidding offers found for this product and attribute",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      biddingOffers: productOfferList,
    });
  }
);

exports.getAttributeOptionBiddingOffers = catchAsyncErrors(
  async (req, res, next) => {
    const productOfferList = await BiddingOffer.find({
      selectedAttributeId: req.params.selectedAttributeId,
    })
      .populate("user", "name")
      .populate("productId", "name")
      .populate({
        path: "selectedAttributeId",
        select: "optionName",
        populate: {
          path: "attributeId",
          select: "name",
        },
      })
      .sort({ validUntil: -1 });

    if (!productOfferList) {
      return next(
        new ErrorHandler(
          "No bidding offers found for this attribute option",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      biddingOffers: productOfferList,
    });
  }
);
