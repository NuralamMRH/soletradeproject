const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middlewares/auth");
const {
  getAllActivities,
  createActivity,
  getMyActivities,
  deleteActivity,
} = require("../controllers/activityController");

router
  .route("/")
  .get(getAllActivities)
  .post(isAuthenticatedUser, createActivity);

router
  .route("/:id")
  .get(isAuthenticatedUser, getMyActivities)
  .delete(isAuthenticatedUser, deleteActivity);

module.exports = router;
