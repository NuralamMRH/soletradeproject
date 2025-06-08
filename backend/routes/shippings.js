const express = require("express");
const router = express.Router();
const {
  getAllShipping,
  getShippingById,
  createShipping,
  updateShipping,
  deleteShipping,
  calculateShippingCost,
  getMyShipping,
} = require("../controllers/shippingController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Public routes
router.route("/calculate").post(calculateShippingCost);

router.route("/").get(getAllShipping).post(isAuthenticatedUser, createShipping);
router.route("/me").get(isAuthenticatedUser, getMyShipping);
router
  .route("/:id")
  .get(getShippingById)
  .put(isAuthenticatedUser, updateShipping)
  .delete(isAuthenticatedUser, deleteShipping);

module.exports = router;
