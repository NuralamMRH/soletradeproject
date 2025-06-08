const Activity = require("../models/Activity");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

// Add a log and send a notification
exports.createActivity = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = {
      user_id: req.user.id,
      ...req.body,
    };
    const activity = new Activity(data);
    await activity.save();

    res.status(200).json({
      success: true,
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error.message);
    return next(new ErrorHandler("Could not create activity", 500));
  }
});

exports.getAllActivities = catchAsyncErrors(async (req, res) => {
  try {
    const activities = await Activity.find({});
    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching activities",
    });
  }
});

// Fetch logs for a specific user
exports.getMyActivities = catchAsyncErrors(async (req, res) => {
  try {
    if (!req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activities = await Activity.find({ user_id: req.user.id })
      .sort({ seen: 1, createdAt: -1 }) // Unseen logs first, then by creation time
      .limit(50); // Pagination can be added later

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching logs",
    });
  }
});

// Delete a log
exports.deleteActivity = catchAsyncErrors(async (req, res) => {
  try {
    const { activity_id } = req.params;

    await Activity.findByIdAndDelete(activity_id);

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting activity",
    });
  }
});
