const express = require("express");
const router = express.Router();
const {
  getAllSoleCheckItems,
  getSoleCheckItemById,
  createSoleCheckItem,
  updateSoleCheckItem,
  deleteSoleCheckItem,
  getSoleCheckItemsByUser,
  getSoleCheckItemsByBrand,
} = require("../controllers/soleCheckItemController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllSoleCheckItems);
router.route("/:id").get(getSoleCheckItemById);
router
  .route("/")
  .post(
    upload.fields([
      { name: "appearanceImage", maxCount: 1 },
      { name: "insideLabelImage" },
      { name: "insoleImage" },
      { name: "insoleStitchImage" },
      { name: "boxLabelImage" },
      { name: "dateCodeImage" },
      { name: "additionalImages" },
    ]),
    isAuthenticatedUser,
    createSoleCheckItem
  );
router
  .route("/:id")
  .put(
    upload.fields([
      { name: "appearanceImage", maxCount: 1 },
      { name: "insideLabelImage" },
      { name: "insoleImage" },
      { name: "insoleStitchImage" },
      { name: "boxLabelImage" },
      { name: "dateCodeImage" },
      { name: "additionalImages" },
    ]),
    isAuthenticatedUser,
    updateSoleCheckItem
  );
router.route("/:id").delete(isAuthenticatedUser, deleteSoleCheckItem);
router.route("/user").get(isAuthenticatedUser, getSoleCheckItemsByUser);
router.route("/brand/:brandId").get(getSoleCheckItemsByBrand);

module.exports = router;
