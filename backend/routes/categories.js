const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.route("/").get(getAllCategories);
router.route("/:id").get(getCategoryById);
router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    createCategory
  );

router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateCategory
  )
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

module.exports = router;
