const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  incrementProductViews,
  deleteProduct,
  getProductCount,
  getFeaturedProducts,
  getProductsBySize,
} = require("../controllers/productController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllProducts);
router.route("/search").get(getAllProducts);
router.route("/:id").get(getProductById);

router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }, { name: "images" }]),
    isAuthenticatedUser,
    createProduct
  );

router
  .route("/:id")
  .put(
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "images" },
      { name: "video" },
    ]),
    isAuthenticatedUser,
    updateProduct
  );

router.route("/viewed/:id").get(incrementProductViews);
router.route("/:id").delete(isAuthenticatedUser, deleteProduct);
router.route("/get/count").get(getProductCount);
router.route("/get/featured/:count").get(getFeaturedProducts);
router.route("/size/:attributeOptionId").get(getProductsBySize);

module.exports = router;
