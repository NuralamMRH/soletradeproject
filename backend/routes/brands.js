const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");
const upload = require("../config/multerConfig");

router.route("/").get(getAllBrands);
router.route("/:id").get(getBrandById);
router
  .route("/")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createBrand);
router
  .route("/:id")
  .put(upload.fields([{ name: "image", maxCount: 1 }]), updateBrand)
  .delete(deleteBrand);

module.exports = router;
