const express = require("express");
const router = express.Router();
const {
  getAllSoleCheckItems,
  getSoleCheckItemById,
  createSoleCheckItem,
  deleteSoleCheckItem,
  getSoleCheckItemsByUser,
  getSoleCheckItemsByBrand,
  updateSoleCheckItem,
  updateSoleCheckItemStatus,
} = require("../controllers/soleCheckItemController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllSoleCheckItems);
router.route("/:id").get(getSoleCheckItemById);
// Create new selling item with file upload
router
  .route("/")
  .post(
    upload.fields([{ name: "images" }]),
    isAuthenticatedUser,
    createSoleCheckItem
  );

// Update selling item with file upload
router
  .route("/:id")
  .put(
    upload.fields([{ name: "images" }]),
    isAuthenticatedUser,
    updateSoleCheckItem
  );
router.route("/status/:id").put(isAuthenticatedUser, updateSoleCheckItemStatus);
router.route("/:id").delete(isAuthenticatedUser, deleteSoleCheckItem);
router.route("/user").get(isAuthenticatedUser, getSoleCheckItemsByUser);
router.route("/brand/:brandId").get(getSoleCheckItemsByBrand);

module.exports = router;
