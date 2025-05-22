const express = require("express");
const router = express.Router();

const {
  getSettings,
  getImageRequirements,
  addImageRequirement,
  updateImageRequirement,
  deleteImageRequirement,
  getAuthServices,
  addAuthService,
  updateAuthService,
  deleteAuthService,
  getTopupPackages,
  addTopupPackage,
  updateTopupPackage,
  deleteTopupPackage,
} = require("../controllers/soleCheckSettingController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const upload = require("../config/multerConfig");

// General Settings
router.route("/settings").get(getSettings);

// Image Requirements Routes
router
  .route("/image-requirements")
  .get(getImageRequirements)
  .post(
    upload.fields([{ name: "example", maxCount: 1 }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    addImageRequirement
  );

router
  .route("/image-requirements/:id")
  .put(
    upload.fields([{ name: "example", maxCount: 1 }]),
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateImageRequirement
  )
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteImageRequirement);

// Auth Services Routes
router
  .route("/auth-services")
  .get(getAuthServices)
  .post(isAuthenticatedUser, authorizeRoles("admin"), addAuthService);

router
  .route("/auth-services/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateAuthService)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAuthService);

// Topup Packages Routes
router
  .route("/topup-packages")
  .get(getTopupPackages)
  .post(isAuthenticatedUser, authorizeRoles("admin"), addTopupPackage);

router
  .route("/topup-packages/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateTopupPackage)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteTopupPackage);

module.exports = router;
