const express = require("express");
const router = express.Router();
const {
  createTierBenefit,
  getTierBenefits,
  updateTierBenefit,
  deleteTierBenefit,
} = require("../controllers/tierBenefitController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// All routes are protected and require admin access

router
  .route("/")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createTierBenefit);

router.route("/:tierId").get(getTierBenefits);

router
  .route("/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateTierBenefit)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteTierBenefit);

module.exports = router;
