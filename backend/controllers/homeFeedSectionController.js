const HomeFeedSection = require("../models/HomeFeedSection");
const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require("../utils/apiFeatures");
const Product = require("../models/product");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getAllHomeFeedSections = catchAsyncErrors(async (req, res, next) => {
  try {
    let query = HomeFeedSection.find()
      .populate("products")
      .populate("categories")
      .populate("brands")
      .populate({
        path: "column_products",
        populate: { path: "products", populate: { path: "variations" } },
      })

      .populate({
        path: "column_brands",
        populate: { path: "brands" },
      })
      .populate({
        path: "column_categories",
        populate: { path: "categories" },
      });

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
      homeFeedSections: result.data,
    });
  } catch (error) {
    console.error("Error in getAllHomeFeedSections:", error);
    next(error);
  }
});

exports.getHomeFeedSectionById = catchAsyncErrors(async (req, res, next) => {
  const homeFeedSection = await HomeFeedSection.findById(req.params.id)
    .populate("products")
    .populate("categories")
    .populate("brands");

  if (!homeFeedSection) {
    return next(new ErrorHandler("Home feed section not found", 404));
  }

  let query;

  if (
    homeFeedSection.display_type === "product" ||
    homeFeedSection.display_type === "recommended-items" ||
    homeFeedSection.display_type === "trending-items" ||
    homeFeedSection.display_type === "new-items" ||
    homeFeedSection.display_type === "best-sellers" ||
    homeFeedSection.display_type === "random-items" ||
    homeFeedSection.display_type === "most-viewed" ||
    homeFeedSection.display_type === "most-liked" ||
    homeFeedSection.display_type === "most-sold" ||
    homeFeedSection.display_type === "most-popular" ||
    homeFeedSection.display_type === "most-recent" ||
    homeFeedSection.display_type === "most-saved" ||
    homeFeedSection.display_type === "most-reviewed" ||
    homeFeedSection.display_type === "most-recommended" ||
    homeFeedSection.display_type === "most-popular-items" ||
    homeFeedSection.display_type === "most-popular-categories" ||
    homeFeedSection.display_type === "most-popular-brands" ||
    homeFeedSection.display_type === "most-popular-products" ||
    homeFeedSection.display_type === "recent-viewed" ||
    homeFeedSection.display_type === "most-relevant" ||
    homeFeedSection.display_type === "most-relevant-items" ||
    homeFeedSection.display_type === "most-relevant-products" ||
    homeFeedSection.display_type === "most-relevant-categories" ||
    homeFeedSection.display_type === "most-relevant-brands" ||
    homeFeedSection.display_type === "hot-items" ||
    homeFeedSection.display_type === "most-click" ||
    homeFeedSection.display_type === "most-click-items" ||
    homeFeedSection.display_type === "most-click-products" ||
    homeFeedSection.display_type === "most-click-categories" ||
    homeFeedSection.display_type === "most-click-brands" ||
    homeFeedSection.display_type === "most-click-items" ||
    homeFeedSection.display_type === "most-click-products" ||
    homeFeedSection.display_type === "most-click-categories" ||
    homeFeedSection.display_type === "most-click-brands"
  ) {
    query = homeFeedSection.products;
  }

  if (
    homeFeedSection.display_type === "category" ||
    homeFeedSection.display_type === "most-popular-categories" ||
    homeFeedSection.display_type === "most-relevant-categories" ||
    homeFeedSection.display_type === "most-click-categories"
  ) {
    query = homeFeedSection.categories;
  }

  if (
    homeFeedSection.display_type === "brand" ||
    homeFeedSection.display_type === "most-popular-brands" ||
    homeFeedSection.display_type === "most-relevant-brands" ||
    homeFeedSection.display_type === "most-click-brands"
  ) {
    query = homeFeedSection.brands;
  }

  const apiFeatures = new APIFeatures(query, req.query);
  await apiFeatures.search();
  await apiFeatures.filter();
  const result = await apiFeatures.execute();

  res.status(200).json({
    success: true,
    homeFeedSection,
    count: result.data.length,
    filteredCount: result.filteredCount,
    resPerPage: result.resPerPage,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
    result: result.data,
  });
});

exports.createHomeFeedSection = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log(
      "Creating home feed section with data:",
      JSON.stringify(req.body, null, 2)
    );

    if (!req.body.name) {
      return next(new ErrorHandler("Section name is required", 400));
    }

    if (!req.body.mode) {
      return next(new ErrorHandler("Mode is required", 400));
    }

    // Set default variable_source if not provided or empty
    if (!req.body.variable_source || req.body.variable_source === "") {
      req.body.variable_source = "products"; // Default to products
    }

    const section = await HomeFeedSection.create(req.body);

    console.log("Created section:", JSON.stringify(section, null, 2));

    res.status(201).json({
      success: true,
      section,
    });
  } catch (error) {
    console.error("Error creating home feed section:", error);
    if (error.name === "ValidationError") {
      return next(new ErrorHandler(error.message, 400));
    }
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.updateHomeFeedSection = catchAsyncErrors(async (req, res, next) => {
  const section = await HomeFeedSection.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!section) {
    return next(new ErrorHandler("Home feed section not found", 404));
  }

  res.status(200).json({
    success: true,
    section,
  });
});

exports.deleteHomeFeedSection = catchAsyncErrors(async (req, res, next) => {
  const section = await HomeFeedSection.findById(req.params.id);

  if (!section) {
    return next(new ErrorHandler("Home feed section not found", 404));
  }

  await section.deleteOne();

  res.status(200).json({
    success: true,
    message: "Home feed section deleted successfully",
  });
});

exports.getHomeFeedSectionCount = catchAsyncErrors(async (req, res, next) => {
  const homeFeedSectionCount = await HomeFeedSection.countDocuments();

  if (!homeFeedSectionCount) {
    return next(new ErrorHandler("Error getting home feed section count", 500));
  }

  res.status(200).json({
    success: true,
    homeFeedSectionCount,
  });
});

exports.autoPopulateSection = catchAsyncErrors(async (req, res, next) => {
  const section = await HomeFeedSection.findById(req.params.id);

  if (!section) {
    return next(new ErrorHandler("Home feed section not found", 404));
  }

  if (section.mode !== "auto") {
    return next(new ErrorHandler("Section is not in auto mode", 400));
  }

  const { productType, sortBy, minRating, priceRange } = section.autoCriteria;

  let query = {};

  if (productType !== "all") {
    query.product_type = productType;
  }

  if (minRating > 0) {
    query.rating = { $gte: minRating };
  }

  if (priceRange.min > 0 || priceRange.max > 0) {
    query.retailPrice = {};
    if (priceRange.min > 0) {
      query.retailPrice.$gte = priceRange.min;
    }
    if (priceRange.max > 0) {
      query.retailPrice.$lte = priceRange.max;
    }
  }

  let sortOptions = {};
  switch (sortBy) {
    case "newest":
      sortOptions = { dateCreated: -1 };
      break;
    case "popular":
      sortOptions = { numViews: -1 };
      break;
    case "price-asc":
      sortOptions = { retailPrice: 1 };
      break;
    case "price-desc":
      sortOptions = { retailPrice: -1 };
      break;
    case "rating":
      sortOptions = { rating: -1 };
      break;
    default:
      sortOptions = { dateCreated: -1 };
  }

  const products = await Product.find(query)
    .sort(sortOptions)
    .limit(section.number_of_items);

  section.products = products.map((product) => product._id);
  await section.save();

  res.status(200).json({
    success: true,
    section,
  });
});
