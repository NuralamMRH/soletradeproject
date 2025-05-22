const { Product } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const {
  filesUpdatePromises,
  filesUpdateWithExisting,
  deleteFilesByUrls,
  deleteFileByUrl,
  deleteFilesByFields,
} = require("../utils/fileUploader");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const { BiddingOffer } = require("../models/biddingOffer");
const { User } = require("../models/user");
const { SellingItem } = require("../models/sellingItem");
const { Order } = require("../models/order");

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    // If count_only is true, optimize the query to only get the count
    const countOnly = req.query.count_only === "true";

    // Base query with population
    let query = Product.find();

    // Only populate related data if not just counting
    if (!countOnly) {
      query = query
        .populate("category")
        .populate("brand")
        .populate("indicator")
        .populate("attributeId")
        .populate({
          path: "variations",
          populate: {
            path: "attributeId",
          },
        });
    }

    // Apply APIFeatures for search, filter, and pagination
    const apiFeatures = new APIFeatures(query, req.query);
    await apiFeatures.search();
    await apiFeatures.filter();

    // For count only, we don't need to return all the data
    if (countOnly) {
      // Get just the count information
      const totalCount = await query.countDocuments();

      return res.status(200).json({
        success: true,
        filteredCount: totalCount,
      });
    }

    const result = await apiFeatures.execute();

    res.status(200).json({
      success: true,
      count: result.data.length,
      filteredCount: result.filteredCount,
      resPerPage: result.resPerPage,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      products: result.data,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    next(error);
  }
});

exports.getProductById = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .populate("brand")
    .populate("indicator")
    .populate("attributeId")
    .populate({
      path: "variations",
      populate: {
        path: "attributeId",
      },
    });

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new ErrorHandler("Invalid category", 400));
    }

    console.log("Product Data: ", req.body);

    const fileFieldsToUpload = ["image", "images"];
    const uploadedFile = await filesUpdatePromises(
      req,
      res,
      next,
      fileFieldsToUpload,
      "product"
    );

    console.log("Uploaded File: ", uploadedFile);

    // Create product with parsed variations
    const productData = {
      ...req.body,
      ...uploadedFile,
    };

    // Handle essential product specific fields
    if (productData.product_type === "essential") {
      productData.stocks = Number(productData.stocks) || 0;
      productData.countInStock = Number(productData.stocks);
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    if (!savedProduct) {
      return next(new ErrorHandler("Error creating product", 500));
    }

    res.status(201).json({
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find the existing product first
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate category if provided
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }
    }

    let uploadedFile;
    // Handle file uploads
    if (req.files) {
      const multiFields = ["images"];
      uploadedFile = await filesUpdatePromises(
        req,
        res,
        next,
        multiFields,
        "product",
        existingProduct
      );
    }

    // Generate full URLs for images

    // Handle variations - ensure they are valid ObjectIds
    if (updateData.variations) {
      // Filter out any empty or invalid values
      updateData.variations = updateData.variations.filter(
        (variation) =>
          variation && typeof variation === "string" && variation.length > 0
      );

      // If no valid variations, remove the field
      if (updateData.variations.length === 0) {
        delete updateData.variations;
      }
    }

    // Prepare update data
    const updateFields = {
      ...updateData,
      ...uploadedFile,
      // Ensure numeric fields are properly converted
      retailPrice: updateData.retailPrice
        ? Number(updateData.retailPrice)
        : undefined,
      countInStock: updateData.countInStock
        ? Number(updateData.countInStock)
        : undefined,
      stocks: updateData.stocks ? Number(updateData.stocks) : undefined,
      // Ensure boolean fields are properly converted
      isIndicatorActive: updateData.isIndicatorActive === "true",
      isCalenderActive: updateData.isCalenderActive === "true",
      isFeatured: updateData.isFeatured === "true",
    };

    // Remove any undefined or empty values
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined || updateFields[key] === "") {
        delete updateFields[key];
      }
    });

    // Update the product with populated related data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
          { path: "variations", select: "optionName" },
        ],
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating product",
    });
  }
});

exports.incrementProductViews = catchAsyncErrors(async (req, res, next) => {
  const viewed = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $inc: { numViews: 1 },
    },
    { new: true }
  );

  if (!viewed) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product: viewed,
  });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  // First get the product to access its files
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const fileFieldsToDelete = ["image", "images"];

  // Delete all associated files using the new function
  await deleteFilesByFields(product, fileFieldsToDelete);

  // Delete the product from database
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product and associated files deleted successfully",
  });
});

// New function to delete a specific file from a product
exports.deleteProductFile = catchAsyncErrors(async (req, res, next) => {
  const { productId, fileUrl } = req.params;

  // Find the product
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Delete the file
  await deleteFileByUrl(fileUrl);

  // Update the product document to remove the deleted file
  let updateQuery = {};

  // Check if the deleted file was the main image
  if (product.image_full_url === fileUrl) {
    updateQuery = {
      $unset: { image: 1, image_full_url: 1 },
    };
  } else {
    // Remove the file from the images array
    updateQuery = {
      $pull: {
        images: { file_full_url: fileUrl },
      },
    };
  }

  // Update the product document
  await Product.findByIdAndUpdate(productId, updateQuery);

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
});

exports.getProductCount = catchAsyncErrors(async (req, res, next) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    return next(new ErrorHandler("Error getting product count", 500));
  }

  res.status(200).json({
    success: true,
    productCount,
  });
});

exports.getFeaturedProducts = catchAsyncErrors(async (req, res, next) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    return next(new ErrorHandler("Featured products not found", 500));
  }

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getProductsBySize = catchAsyncErrors(async (req, res, next) => {
  const attributeOptionId = req.params.attributeOptionId;

  const products = await Product.find({
    variations: {
      $elemMatch: {
        attributeOptionId: attributeOptionId,
      },
    },
  });

  if (!products || products.length === 0) {
    return next(new ErrorHandler("No products found for this size", 404));
  }

  res.status(200).json({
    success: true,
    products,
  });
});
