const express = require("express");
const router = express.Router();

const {
  getAllSoleCheckModels,
  getSoleCheckModelById,
  createSoleCheckModel,
  updateSoleCheckModel,
  deleteSoleCheckModel,
  getSoleCheckModelsByBrand,
  getActiveSoleCheckModels,
} = require("../controllers/soleCheckModelController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const upload = require("../config/multerConfig");

router.route("/").get(getAllSoleCheckModels);
router.route("/:id").get(getSoleCheckModelById);
router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSoleCheckModel
  );
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSoleCheckModel
  );
router.route("/:id").delete(isAuthenticatedUser, deleteSoleCheckModel);
router.route("/brand/:brandId").get(getSoleCheckModelsByBrand);
router.route("/active").get(getActiveSoleCheckModels);

module.exports = router;
