const express = require("express");
const {
  getIndicators,
  getIndicator,
  createIndicator,
  updateIndicator,
  deleteIndicator,
} = require("../controllers/indicatorController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.route("/").get(getIndicators);
router.route("/:id").get(getIndicator);

router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    createIndicator
  );
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateIndicator
  )
  .delete(deleteIndicator);

module.exports = router;
