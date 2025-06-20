const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middlewares/auth");
const {
  getAllSearchKeywords,
  getSearchKeywordById,
  deleteSearchKeyword,
  deleteManySearchKeywords,
} = require("../controllers/log/searchKeywordController");

// Get all search items for current user
router.get("/", getAllSearchKeywords);

// Get search item by ID
router.get("/:id", isAuthenticatedUser, getSearchKeywordById);

// Delete search item
router.delete("/:id", isAuthenticatedUser, deleteSearchKeyword);

// Delete many search items
router.delete("/", isAuthenticatedUser, deleteManySearchKeywords);

module.exports = router;
