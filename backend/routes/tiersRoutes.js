const express = require("express");
const router = express.Router();
const {
  getAllTiers,
  getTierById,
  createTier,
  updateTier,
  deleteTier,
  getTierCount,
  getTiersByTierType,
} = require("../controllers/tiersController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Public routes /api/v1/tiers
router.get("/", getAllTiers); // Get all tiers /api/v1/tiers
router.get("/count", getTierCount); // Get the count of tiers /api/v1/tiers/count
router.get("/type/:type", getTiersByTierType); // Get tiers by tier type /api/v1/tiers/tier-type/:type
router.get("/:id", getTierById); // Get tier by id /api/v1/tiers/:id

// Protected routes (Admin only) /api/v1/tiers
router.post("/", isAuthenticatedUser, authorizeRoles("admin"), createTier);

router.put("/:id", isAuthenticatedUser, authorizeRoles("admin"), updateTier); // Update tier by id /api/v1/tiers/:id

router.delete("/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteTier); // Delete tier by id /api/v1/tiers/:id

module.exports = router;
