const { Category } = require("../models/category");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const {
  filesUpdatePromises,
  deleteFilesByFields,
} = require("../utils/fileUploader");

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categoryList = await Category.find()
    .populate("subCategories")
    .populate("products");

  if (!categoryList) {
    return next(new ErrorHandler("Categories not found", 500));
  }

  res.status(200).json({
    success: true,
    categories: categoryList,
  });
});

exports.getCategoryById = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate("subCategories")
    .populate("products");

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    category,
  });
});

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
  const imageFields = ["image"];
  console.log("Image uploaded", req.files);

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "category"
  );

  const category = new Category({
    ...req.body,
    ...uploadedFile,
  });

  const savedCategory = await category.save();

  if (!savedCategory) {
    return next(new ErrorHandler("Error creating category", 400));
  }

  res.status(201).json({
    success: true,
    category: savedCategory,
  });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  const imageFields = ["image"];

  const uploadedFile = await filesUpdatePromises(
    req,
    res,
    next,
    imageFields,
    "category"
  );

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...uploadedFile,
    },
    { new: true }
  );

  if (!updatedCategory) {
    return next(new ErrorHandler("Error updating category", 400));
  }

  res.status(200).json({
    success: true,
    category: updatedCategory,
  });
});

exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  // Delete the image file if it exists
  const fileFieldsToDelete = ["image"];

  // Delete all associated files using the function
  await deleteFilesByFields(category, fileFieldsToDelete);

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
