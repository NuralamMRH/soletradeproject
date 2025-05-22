const express = require("express");
const router = express.Router();
const {
  getAllSoleDraws,
  getSoleDrawById,
  createSoleDraw,
  updateSoleDraw,
  deleteSoleDraw,
  getActiveSoleDraws,
  getSoleDrawsByProduct,
  getSoleDrawsByUser,
} = require("../controllers/soleDrawController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const upload = require("../config/multerConfig");

router.route("/").get(getAllSoleDraws);
router.route("/:id").get(getSoleDrawById);
router
  .route("/")
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    createSoleDraw
  );
router
  .route("/:id")
  .put(
    upload.fields([{ name: "image", maxCount: 1 }]),
    isAuthenticatedUser,
    updateSoleDraw
  );
router.route("/:id").delete(isAuthenticatedUser, deleteSoleDraw);
router.route("/active").get(getActiveSoleDraws);
router.route("/product/:productId").get(getSoleDrawsByProduct);
router.route("/user/:userId").get(getSoleDrawsByUser);

module.exports = router;
