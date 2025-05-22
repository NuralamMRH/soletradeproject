const express = require("express");
const router = express.Router();
const {
  getAllShipping,
  getShippingById,
  createShipping,
  updateShipping,
  deleteShipping,
  calculateShippingCost,
} = require("../controllers/shippingController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Public routes
router.route("/calculate").post(calculateShippingCost);

// Admin routes
router
  .route("/")
  .get(getAllShipping)
  .post(isAuthenticatedUser, authorizeRoles("admin"), createShipping);

router
  .route("/:id")
  .get(getShippingById)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateShipping)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteShipping);

module.exports = router;
