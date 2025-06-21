const express = require("express");
const router = express.Router();

const {
  getAllSoleCheckAuthServices,
  getSoleCheckAuthServiceById,
  createSoleCheckAuthService,
  deleteSoleCheckAuthService,
  deleteManySoleCheckAuthServices,
  updateSoleCheckAuthService,
} = require("../controllers/soleCheckAuthServiceController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllSoleCheckAuthServices);
router.route("/:id").get(getSoleCheckAuthServiceById);
router.route("/").post(isAuthenticatedUser, createSoleCheckAuthService);

router
  .route("/:id")
  .put(isAuthenticatedUser, updateSoleCheckAuthService)
  .delete(isAuthenticatedUser, deleteSoleCheckAuthService);

router
  .route("/delete-many")
  .delete(isAuthenticatedUser, deleteManySoleCheckAuthServices);

module.exports = router;
