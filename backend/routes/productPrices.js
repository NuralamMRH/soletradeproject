const express = require("express");
const router = express.Router();
const {
  getAllProductPrices,
  getProductPriceById,
  createProductPrice,
  updateProductPrice,
  deleteProductPrice,
} = require("../controllers/productPriceController");

router.route("/").get(getAllProductPrices);
router.route("/:id").get(getProductPriceById);
router.route("/").post(createProductPrice);
router.route("/:id").put(updateProductPrice);
router.route("/:id").delete(deleteProductPrice);

module.exports = router;
