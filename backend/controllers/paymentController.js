const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const PaymentMethod = require("../models/PaymentMethod");
const ErrorHandler = require("../utils/errorHandler");

// Create a payment method
exports.createPaymentMethod = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = {
      userId: req.user.id,
      ...req.body,
    };
    console.log(data);
    const paymentMethod = new PaymentMethod(data);
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: "Payment method created successfully",
      paymentMethod,
    });
  } catch (error) {
    console.error("Error creating payment method:", error.message);
    return next(new ErrorHandler("Could not create payment method", 500));
  }
});

// Update a payment method
exports.updatePaymentMethod = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      paymentMethod,
    });
  } catch (error) {
    console.error("Error updating payment method:", error.message);
    return next(new ErrorHandler("Could not update payment method", 500));
  }
});

exports.setDefaultPaymentMethod = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Default payment method set successfully",
      paymentMethod,
    });
  } catch (error) {
    console.error("Error setting default payment method:", error.message);
    return next(new ErrorHandler("Could not set default payment method", 500));
  }
});

exports.getAllPaymentMethods = catchAsyncErrors(async (req, res) => {
  try {
    const query = req.query;
    const paymentMethods = await PaymentMethod.find(query);
    res.status(200).json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching activities",
    });
  }
});

// Fetch logs for a specific user
exports.getMyPaymentMethods = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.user.id) {
      return next(new ErrorHandler("Could not fetch payment methods", 500));
    }

    const query = { userId: req.user.id };

    const paymentMethods = await PaymentMethod.find(query);

    res.status(200).json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    return next(new ErrorHandler("Could not fetch payment methods", 500));
  }
});

exports.getByIdPaymentMethod = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findById(id);

    res.status(200).json({
      success: true,
      paymentMethod,
    });
  } catch (error) {
    return next(new ErrorHandler("Could not fetch payment method", 500));
  }
});

// Delete a log
exports.deletePaymentMethod = catchAsyncErrors(async (req, res) => {
  try {
    const { paymentMethod_id } = req.params;

    await PaymentMethod.findByIdAndDelete(paymentMethod_id);

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting activity",
    });
  }
});
