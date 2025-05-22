const express = require("express");
const {
  getFeedButtons,
  getFeedButton,
  createFeedButton,
  updateFeedButton,
  deleteFeedButton,
} = require("../controllers/homeFeedButtonController");
const upload = require("../config/multerConfig");

const router = express.Router();

// Public routes /api/v1/home-feed-buttons
router
  .route("/")
  .get(getFeedButtons)
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createFeedButton);

router
  .route("/:id")
  .get(getFeedButton)
  .put(upload.fields([{ name: "image", maxCount: 1 }]), updateFeedButton)
  .delete(deleteFeedButton);

module.exports = router;
