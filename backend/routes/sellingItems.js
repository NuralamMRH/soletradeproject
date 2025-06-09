const express = require("express");
const router = express.Router();
const {
  getAllSellingItems,
  getSellingItemById,
  getTotalSalesCount,
  getUserSellingItems,
  getProductOffers,
  getOffersByProductAndAttribute,
  createSellingItem,
  updateSellingItem,
  deleteSellingItem,
  getSellingItemsByProduct,
  getSellingItemsByUser,
} = require("../controllers/sellingItemController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const upload = require("../config/multerConfig");

// Get all selling items
router.route("/").get(getAllSellingItems);

// Get selling item by ID
router.route("/:id").get(getSellingItemById);

// Get total sales count
router.route("/get/count").get(getTotalSalesCount);

// Get user's selling items
router.route("/get/sells").get(isAuthenticatedUser, getUserSellingItems);

// Get product offers
router.route("/offers/:productId").get(getProductOffers);

// Get offers by product and attribute
router.route("/offers/:productId/:sizeId").get(getOffersByProductAndAttribute);

// Create new selling item with file upload
router
  .route("/")
  .post(
    upload.fields([{ name: "images" }]),
    isAuthenticatedUser,
    createSellingItem
  );

// Update selling item with file upload
router
  .route("/:id")
  .put(
    upload.fields([{ name: "images" }]),
    isAuthenticatedUser,
    updateSellingItem
  );

// Delete selling item
router.route("/:id").delete(isAuthenticatedUser, deleteSellingItem);

// Get selling items by product
router.route("/product/:productId").get(getSellingItemsByProduct);

// Get selling items by user
router.route("/user").get(isAuthenticatedUser, getSellingItemsByUser);

module.exports = router;
