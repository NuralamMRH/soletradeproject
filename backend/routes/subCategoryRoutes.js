const express = require("express");

const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.route("/").get(getSubCategories);
router.route("/:id").get(getSubCategory);

router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSubCategory
  );
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSubCategory
  )
  .delete(isAuthenticatedUser, deleteSubCategory);

module.exports = router;
