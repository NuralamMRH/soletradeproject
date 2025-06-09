const { Order } = require("../models/order");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orderList = await Order.find()
    .populate("user")
    .populate("items")
    .populate("size")
    .populate("sellerOffer")
    .populate("buyerOffer")
    .populate("voucher")
    .populate("shippingAddress")
    .populate("paymentMethod");

  if (!orderList) {
    return next(new ErrorHandler("Orders not found", 500));
  }

  res.status(200).json({
    success: true,
    orders: orderList,
  });
});



exports.getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate("items")
    .populate("size")
    .populate("sellerOffer")
    .populate("buyerOffer")
    .populate("voucher")
    .populate("shippingAddress")
    .populate("paymentMethod");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const order = new Order({
    userId: req.user.id,
    ...req.body,
  });

  const savedOrder = await order.save();

  if (!savedOrder) {
    return next(new ErrorHandler("Error creating order", 400));
  }

  res.status(201).json({
    success: true,
    order: savedOrder,
  });
});

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  if (!updatedOrder) {
    return next(new ErrorHandler("Error updating order", 400));
  }

  res.status(200).json({
    success: true,
    order: updatedOrder,
  });
});

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
