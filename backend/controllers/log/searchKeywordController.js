const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const { SearchKeyword } = require("../../models/SearchKeyword");

// Get all search keyword statistics
exports.getAllSearchKeywords = catchAsyncErrors(async (req, res, next) => {
  const { keyword } = req.query;

  // Get global search statistics
  const [topSearches, recentSearches, keywordStats] = await Promise.all([
    SearchKeyword.getGlobalTopSearches(10),
    SearchKeyword.getGlobalRecentSearches(10),
    keyword ? SearchKeyword.getGlobalKeywordCount(keyword) : null,
  ]);

  res.status(200).json({
    success: true,
    topSearches,
    recentSearches,
    keywordStats: keyword ? keywordStats : null,
  });
});

// Get search keyword by ID
exports.getSearchKeywordById = catchAsyncErrors(async (req, res, next) => {
  const searchKeyword = await SearchKeyword.findById(req.params.id).populate(
    "user"
  );

  if (!searchKeyword) {
    return next(new ErrorHandler("Search keyword not found", 404));
  }

  res.status(200).json({
    success: true,
    searchKeyword,
  });
});

// Delete search keyword
exports.deleteSearchKeyword = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const searchKeyword = await SearchKeyword.findByIdAndDelete(req.params.id);

  if (!searchKeyword) {
    return next(new ErrorHandler("Search keyword not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Search keyword deleted successfully",
  });
});

// Delete many search keywords
exports.deleteManySearchKeywords = catchAsyncErrors(async (req, res, next) => {
  try {
    // Validate input
    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return next(new ErrorHandler("Invalid request data", 400));
    }

    // Find the s to delete
    const searchKeywords = await SearchKeyword.find({
      _id: { $in: req.body.ids },
    });
    if (!searchKeywords || searchKeywords.length === 0) {
      return next(new ErrorHandler("Search keywords not found", 404));
    }

    // Perform deletion
    await SearchKeyword.deleteMany({ _id: { $in: req.body.ids } });

    res.status(200).json({
      success: true,
      message: "Search keywords have been deleted successfully.",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting search keywords: ${error.message}`, 500)
    );
  }
});
