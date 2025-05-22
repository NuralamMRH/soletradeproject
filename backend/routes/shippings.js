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

router
  .route("/")
  .get(isAuthenticatedUser, getMyShipping)
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllShipping)
  .post(isAuthenticatedUser, createShipping);

router
  .route("/:id")
  .get(getShippingById)
  .put(isAuthenticatedUser, updateShipping)
  .delete(isAuthenticatedUser, deleteShipping);

module.exports = router;
