const express = require("express");
const router = express.Router();
const {
  createHomeFeedSection,
  getAllHomeFeedSections,
  updateHomeFeedSection,
  deleteHomeFeedSection,
  autoPopulateSection,
  getHomeFeedSectionById,
} = require("../controllers/homeFeedSectionController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

// Public routes
router.get("/", getAllHomeFeedSections);
router.get("/:id", getHomeFeedSectionById);

// Protected routes (admin only)
router.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createHomeFeedSection
);

router.put(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateHomeFeedSection
);

router.delete(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteHomeFeedSection
);

router.post(
  "/:id/auto-populate",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  autoPopulateSection
);

module.exports = router;
