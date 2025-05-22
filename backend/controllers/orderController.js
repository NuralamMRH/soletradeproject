const { Order } = require("../models/order");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orderList = await Order.find()
    .populate("user")
    .populate("mainProduct")
    .populate("size")
    .populate("sellerOffer");

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
    .populate("mainProduct")
    .populate("size")
    .populate("sellerOffer");

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
    user: req.body.user,
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
      orderType: req.body.orderType,
      orderStatus: req.body.orderStatus,
      validUntil: req.body.validUntil,
      totalPrice: req.body.totalPrice,
      offerPrice: req.body.offerPrice,
      sellerOffer: req.body.sellerOffer,
      mainProduct: req.body.mainProduct,
      size: req.body.size,
      billingAddress1: req.body.billingAddress1,
      billingAddress2: req.body.billingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      itemCondition: req.body.itemCondition,
      packaging: req.body.packaging,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus,
      paymentDate: req.body.paymentDate,
      user: req.body.user,
      shippingStatus: req.body.shippingStatus,
    },
    { new: true }
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

exports.getOrdersByUser = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.params.userId })
    .populate("mainProduct")
    .populate("size")
    .populate("sellerOffer");

  if (!orders) {
    return next(new ErrorHandler("Orders not found", 500));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});
