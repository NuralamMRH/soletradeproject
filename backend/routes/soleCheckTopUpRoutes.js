const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middlewares/auth");
const {
  getAllSoleCheckTopUps,
  getSoleCheckTopUpById,
  createSoleCheckTopUp,
  updateSoleCheckTopUp,
  deleteSoleCheckTopUp,
} = require("../controllers/soleCheckTopUpController");
const upload = require("../config/multerConfig");

router.route("/").get(getAllSoleCheckTopUps);
router.route("/:id").get(getSoleCheckTopUpById);
router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSoleCheckTopUp
  );
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSoleCheckTopUp
  );
router.route("/:id").delete(isAuthenticatedUser, deleteSoleCheckTopUp);

module.exports = router;
