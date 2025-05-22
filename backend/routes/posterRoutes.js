const express = require("express");
const router = express.Router();
const {
  createPoster,
  getPosters,
  getPoster,
  updatePoster,
  deletePoster,
} = require("../controllers/posterController");
const upload = require("../config/multerConfig");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/auth");

router
  .route("/")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.fields([{ name: "image", maxCount: 1 }]),
    createPoster
  )
  .get(getPosters);

router
  .route("/:id")
  .get(getPoster)
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.fields([{ name: "image", maxCount: 1 }]),
    updatePoster
  )
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deletePoster);

module.exports = router;
