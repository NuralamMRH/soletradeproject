const express = require("express");
const router = express.Router();
const {
  createUpdateAppContent,
  getAppContent,
  deleteAppContent,
  deleteAppContentFile,
} = require("../controllers/appContentController");
const upload = require("../config/multerConfig");
const { isAuthenticatedUser } = require("../middlewares/auth");

router
  .route("/")
  .get(getAppContent)
  .post(
    isAuthenticatedUser,
    upload.fields([
      { name: "appLogo", maxCount: 1 },
      { name: "launchScreenFile", maxCount: 1 },
      { name: "homeSlider" },
      { name: "soleCheckSlider" },
    ]),
    createUpdateAppContent
  );

router.route("/:id").delete(deleteAppContent);

router.route("/file").put(deleteAppContentFile);

module.exports = router;
