const Shipping = require("../models/shipping");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Get all shipping methods
exports.getAllShipping = catchAsyncErrors(async (req, res, next) => {
  const apiFeatures = new APIFeatures(Shipping.find(), req.query);
  await apiFeatures.search();
  await apiFeatures.filter();
  const result = await apiFeatures.execute();

  res.status(200).json({
    success: true,
    count: result.data.length,
    shipping: result.data,
  });
});

exports.getMyShipping = catchAsyncErrors(async (req, res, next) => {
  try {
    const shipping = await Shipping.find({ user: req.user.id });

    if (!shipping) {
      return next(new ErrorHandler("Shipping method not found", 404));
    }

    res.status(200).json({
      success: true,
      shipping,
    });
  } catch (error) {
    return next(new ErrorHandler("Shipping method not found", 404));
  }
});

// Get single shipping method
exports.getShippingById = catchAsyncErrors(async (req, res, next) => {
  const shipping = await Shipping.findById(req.params.id);

  if (!shipping) {
    return next(new ErrorHandler("Shipping method not found", 404));
  }

  res.status(200).json({
    success: true,
    shipping,
  });
});

// Create new shipping method
exports.createShipping = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log(req.body);
    const shipping = await Shipping.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      shipping,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Shipping method not created", 400));
  }
});

// Update shipping method
exports.updateShipping = catchAsyncErrors(async (req, res, next) => {
  let shipping = await Shipping.findById(req.params.id);

  if (!shipping) {
    return next(new ErrorHandler("Shipping method not found", 404));
  }

  shipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    shipping,
  });
});

// Delete shipping method
exports.deleteShipping = catchAsyncErrors(async (req, res, next) => {
  const shipping = await Shipping.findById(req.params.id);

  if (!shipping) {
    return next(new ErrorHandler("Shipping method not found", 404));
  }

  await shipping.remove();

  res.status(200).json({
    success: true,
    message: "Shipping method deleted successfully",
  });
});

// Calculate shipping cost
exports.calculateShippingCost = catchAsyncErrors(async (req, res, next) => {
  const { weight, destination, shippingMethod } = req.body;

  if (!weight || !destination || !shippingMethod) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const shipping = await Shipping.findById(shippingMethod);

  if (!shipping) {
    return next(new ErrorHandler("Shipping method not found", 404));
  }

  let cost = shipping.basePrice;

  // Add weight-based cost
  if (weight > shipping.baseWeight) {
    const extraWeight = weight - shipping.baseWeight;
    cost += extraWeight * shipping.pricePerKg;
  }

  // Add destination-based cost
  if (shipping.destinationPrices && shipping.destinationPrices[destination]) {
    cost += shipping.destinationPrices[destination];
  }

  res.status(200).json({
    success: true,
    cost,
    breakdown: {
      basePrice: shipping.basePrice,
      weightCost:
        weight > shipping.baseWeight
          ? (weight - shipping.baseWeight) * shipping.pricePerKg
          : 0,
      destinationCost:
        shipping.destinationPrices && shipping.destinationPrices[destination]
          ? shipping.destinationPrices[destination]
          : 0,
      total: cost,
    },
  });
});

exports.getShippingsByUser = catchAsyncErrors(async (req, res, next) => {
  const shippings = await Shipping.find({ user: req.params.userId }).populate(
    "order"
  );

  if (!shippings) {
    return next(new ErrorHandler("Shippings not found", 500));
  }

  res.status(200).json({
    success: true,
    shippings,
  });
});

exports.getShippingsByOrder = catchAsyncErrors(async (req, res, next) => {
  const shippings = await Shipping.find({ order: req.params.orderId }).populate(
    "user"
  );

  if (!shippings) {
    return next(new ErrorHandler("Shippings not found", 500));
  }

  res.status(200).json({
    success: true,
    shippings,
  });
});
