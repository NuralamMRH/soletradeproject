const express = require("express");
const router = express.Router();
const {
  getAllSoleCheckBrands,
  getSoleCheckBrandById,
  createSoleCheckBrand,
  updateSoleCheckBrand,
  deleteSoleCheckBrand,
  deleteManySoleCheckBrands,
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

router
  .route("/delete-many")
  .delete(isAuthenticatedUser, deleteManySoleCheckBrands);

module.exports = router;
