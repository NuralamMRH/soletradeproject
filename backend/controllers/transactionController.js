const Transaction = require("../models/transaction");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Get all transactions
exports.getAllTransactions = catchAsyncErrors(async (req, res, next) => {
  const transactions = await Transaction.find()
    .populate("buyer", "-passwordHash")
    .populate("seller", "-passwordHash")
    .populate("product")
    .populate("biddingOffer")
    .populate("sellingItem");

  res.status(200).json({
    success: true,
    transactions,
  });
});

// Get transaction by ID
exports.getTransactionById = catchAsyncErrors(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate("buyer", "-passwordHash")
    .populate("seller", "-passwordHash")
    .populate("product")
    .populate("biddingOffer")
    .populate("sellingItem");

  if (!transaction) {
    return next(new ErrorHandler("Transaction not found", 404));
  }

  res.status(200).json({
    success: true,
    transaction,
  });
});

// Create new transaction
exports.createTransaction = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Transaction payload", req.body);
    const transaction = new Transaction({
      userId: req.user.id,
      ...req.body,
    });
    const savedTransaction = await transaction.save();
    if (!savedTransaction) {
      return next(new ErrorHandler("Error creating transaction", 400));
    }
    res.status(201).json({
      success: true,
      transaction: savedTransaction,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update transaction
exports.updateTransaction = catchAsyncErrors(async (req, res, next) => {
  const updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  if (!updatedTransaction) {
    return next(new ErrorHandler("Error updating transaction", 400));
  }
  res.status(200).json({
    success: true,
    transaction: updatedTransaction,
  });
});

// Delete transaction
exports.deleteTransaction = catchAsyncErrors(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);
  if (!transaction) {
    return next(new ErrorHandler("Transaction not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
  });
});

// Get transactions by user (buyer or seller)
exports.getTransactionsByUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const transactions = await Transaction.find({
    $or: [{ buyerId: userId }, { sellerId: userId }],
  })
    .populate("buyer", "-passwordHash")
    .populate("seller", "-passwordHash")
    .populate("product")
    .populate("biddingOffer")
    .populate("sellingItem");

  res.status(200).json({
    success: true,
    transactions,
  });
});

// Get transactions by product
exports.getTransactionsByProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const transactions = await Transaction.find({ productId })
    .populate("buyer", "-passwordHash")
    .populate("seller", "-passwordHash")
    .populate("product")
    .populate("biddingOffer")
    .populate("sellingItem");

  res.status(200).json({
    success: true,
    transactions,
  });
});
