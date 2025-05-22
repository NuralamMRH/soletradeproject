const express = require("express");
const router = express.Router();
const {
  getAllCalenderNotifies,
  getCalenderNotifyById,
  createCalenderNotify,
  updateCalenderNotify,
  deleteCalenderNotify,
  getCalenderNotifiesByUser,
} = require("../controllers/calenderNotifyController");
const { CalenderNotify } = require("../models/calenderNotify");
const {
  handleTriggerNotifications,
} = require("../services/pushNotificationService");

router.get(`/`, getAllCalenderNotifies);
router.route("/:id").get(getCalenderNotifyById);
router
  .route("/")
  .post(createCalenderNotify)
  .put(updateCalenderNotify)
  .delete(deleteCalenderNotify);
router.route("/user/:userId").get(getCalenderNotifiesByUser);

// Function to periodically trigger notifications
const startNotificationInterval = () => {
  const notificationInterval = 60000; // Every 1 minute
  setInterval(async () => {
    try {
      await handleTriggerNotifications(CalenderNotify);
    } catch (error) {
      console.error("Error in notification interval:", error);
    }
  }, notificationInterval);
};

// Start the interval for triggering notifications
startNotificationInterval();

module.exports = router;
