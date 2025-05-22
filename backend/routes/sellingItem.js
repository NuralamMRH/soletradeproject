const express = require("express");
const router = express.Router();
const {
  createSellingItem,
  getSellingItems,
  getSellingItem,
  updateSellingItem,
  deleteSellingItem,
  getSellingItemsByUser,
  getSellingItemsByProduct,
  getSellingItemsByStatus,
  getSellingItemsByCondition,
  getSellingItemsByPriceRange,
  getSellingItemsByDateRange,
  getSellingItemsByBrand,
  getSellingItemsByCategory,
  getSellingItemsBySize,
  getSellingItemsByColor,
  getSellingItemsByConditionAndPrice,
  getSellingItemsByConditionAndSize,
  getSellingItemsByConditionAndColor,
  getSellingItemsByPriceAndSize,
  getSellingItemsByPriceAndColor,
  getSellingItemsBySizeAndColor,
  getSellingItemsByConditionAndPriceAndSize,
  getSellingItemsByConditionAndPriceAndColor,
  getSellingItemsByConditionAndSizeAndColor,
  getSellingItemsByPriceAndSizeAndColor,
  getSellingItemsByConditionAndPriceAndSizeAndColor,
} = require("../controllers/sellingItemController");
const { isAuthenticatedUser } = require("../middleware/auth");

// Create a new selling item
router.route("/").post(isAuthenticatedUser, createSellingItem);

// Get all selling items
router.route("/").get(getSellingItems);

// Get a single selling item
router.route("/:id").get(getSellingItem);

// Update a selling item
router.route("/:id").put(isAuthenticatedUser, updateSellingItem);

// Delete a selling item
router.route("/:id").delete(isAuthenticatedUser, deleteSellingItem);

// Get selling items by user
router.route("/user/:userId").get(getSellingItemsByUser);

// Get selling items by product
router.route("/product/:productId").get(getSellingItemsByProduct);

// Get selling items by status
router.route("/status/:status").get(getSellingItemsByStatus);

// Get selling items by condition
router.route("/condition/:condition").get(getSellingItemsByCondition);

// Get selling items by price range
router.route("/price/:min/:max").get(getSellingItemsByPriceRange);

// Get selling items by date range
router.route("/date/:start/:end").get(getSellingItemsByDateRange);

// Get selling items by brand
router.route("/brand/:brandId").get(getSellingItemsByBrand);

// Get selling items by category
router.route("/category/:categoryId").get(getSellingItemsByCategory);

// Get selling items by size
router.route("/size/:sizeId").get(getSellingItemsBySize);

// Get selling items by color
router.route("/color/:colorId").get(getSellingItemsByColor);

// Get selling items by condition and price
router.route("/condition-price/:condition/:min/:max").get(
  "/condition-price/:condition/:min/:max",
  getSellingItemsByConditionAndPrice
);

// Get selling items by condition and size
router
  .route("/condition-size/:condition/:sizeId")
  .get(getSellingItemsByConditionAndSize);

// Get selling items by condition and color
router
  .route("/condition-color/:condition/:colorId")
  .get(getSellingItemsByConditionAndColor);

// Get selling items by price and size
router
  .route("/price-size/:min/:max/:sizeId")
  .get(getSellingItemsByPriceAndSize);

// Get selling items by price and color
router
  .route("/price-color/:min/:max/:colorId")
  .get(getSellingItemsByPriceAndColor);

// Get selling items by size and color
router
  .route("/size-color/:sizeId/:colorId")
  .get(getSellingItemsBySizeAndColor);

// Get selling items by condition, price and size
router
  .route("/condition-price-size/:condition/:min/:max/:sizeId")
  .get(getSellingItemsByConditionAndPriceAndSize);

// Get selling items by condition, price and color
router
  .route("/condition-price-color/:condition/:min/:max/:colorId")
  .get(getSellingItemsByConditionAndPriceAndColor);

// Get selling items by condition, size and color
router
  .route("/condition-size-color/:condition/:sizeId/:colorId")
  .get(getSellingItemsByConditionAndSizeAndColor);

// Get selling items by price, size and color
router
  .route("/price-size-color/:min/:max/:sizeId/:colorId")
  .get(getSellingItemsByPriceAndSizeAndColor);

// Get selling items by condition, price, size and color
router
  .route("/condition-price-size-color/:condition/:min/:max/:sizeId/:colorId")
  .get(getSellingItemsByConditionAndPriceAndSizeAndColor);

module.exports = router;
