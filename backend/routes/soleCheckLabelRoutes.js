const express = require("express");
const router = express.Router();

const {
  getAllSoleCheckLabels,
  getSoleCheckLabelById,
  createSoleCheckLabel,
  deleteSoleCheckLabel,
  deleteManySoleCheckLabels,
  updateSoleCheckLabel,
} = require("../controllers/soleCheckLabelController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const upload = require("../config/multerConfig");

router.route("/").get(getAllSoleCheckLabels);
router.route("/:id").get(getSoleCheckLabelById);
router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSoleCheckLabel
  );

router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSoleCheckLabel
  )
  .delete(isAuthenticatedUser, deleteSoleCheckLabel);

router
  .route("/delete-many")
  .delete(isAuthenticatedUser, deleteManySoleCheckLabels);

module.exports = router;
