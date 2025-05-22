const { ProductPrice } = require("../models/productVariation");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllProductPrices = catchAsyncErrors(async (req, res, next) => {
  const productPriceList = await ProductPrice.find()
    .populate("productId")
    .populate("attributeOptionId");

  if (!productPriceList) {
    return next(new ErrorHandler("Product prices not found", 500));
  }

  res.status(200).json({
    success: true,
    productPrices: productPriceList,
  });
});

exports.getProductPriceById = catchAsyncErrors(async (req, res, next) => {
  const productPrice = await ProductPrice.findById(req.params.id)
    .populate("productId")
    .populate("attributeOptionId");

  if (!productPrice) {
    return next(new ErrorHandler("Product price not found", 404));
  }

  res.status(200).json({
    success: true,
    productPrice,
  });
});

exports.createProductPrice = catchAsyncErrors(async (req, res, next) => {
  const productPrice = new ProductPrice({
    productId: req.body.productId,
    attributeOptionId: req.body.attributeOptionId,
    price: req.body.price,
  });

  const savedProductPrice = await productPrice.save();

  if (!savedProductPrice) {
    return next(new ErrorHandler("Error creating product price", 400));
  }

  res.status(201).json({
    success: true,
    productPrice: savedProductPrice,
  });
});

exports.updateProductPrice = catchAsyncErrors(async (req, res, next) => {
  const updatedProductPrice = await ProductPrice.findByIdAndUpdate(
    req.params.id,
    {
      attributeOptionId: req.body.attributeOptionId,
      price: req.body.price,
    },
    { new: true }
  );

  if (!updatedProductPrice) {
    return next(new ErrorHandler("Error updating product price", 400));
  }

  res.status(200).json({
    success: true,
    productPrice: updatedProductPrice,
  });
});

exports.deleteProductPrice = catchAsyncErrors(async (req, res, next) => {
  const productPrice = await ProductPrice.findOneAndDelete({
    _id: req.params.id,
  });

  if (!productPrice) {
    return next(new ErrorHandler("Product price not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product price deleted successfully",
  });
});
