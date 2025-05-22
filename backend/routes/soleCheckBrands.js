const express = require("express");
const router = express.Router();
const {
  getAllSoleCheckBrands,
  getSoleCheckBrandById,
  createSoleCheckBrand,
  updateSoleCheckBrand,
  deleteSoleCheckBrand,
} = require("../controllers/soleCheckBrandController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllSoleCheckBrands);

router.route("/:id").get(getSoleCheckBrandById);

router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSoleCheckBrand
  );

router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSoleCheckBrand
  );

router.route("/:id").delete(isAuthenticatedUser, deleteSoleCheckBrand);

module.exports = router;
