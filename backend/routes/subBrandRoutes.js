const express = require("express");
const {
  getSubBrands,
  getSubBrand,
  createSubBrand,
  updateSubBrand,
  deleteSubBrand,
} = require("../controllers/subBrandController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const upload = require("../config/multerConfig");
const router = express.Router();

// Public routes
router.route("/").get(getSubBrands);
router.route("/:id").get(getSubBrand);

router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSubBrand
  );
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSubBrand
  )
  .delete(isAuthenticatedUser, deleteSubBrand);

module.exports = router;
