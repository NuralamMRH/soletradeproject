const socket = require("../../config/socket")
const Log = require("../../models/logs/log")

// Add a log and send a notification
exports.createLog = async (logData) => {
  try {
    const log = new Log(logData)
    await log.save()

    // Emit notification to the user
    const io = socket.getIO()

    console.log("log.user_id: " + log.user_id)

    if (log && log.user_id) {
      const userId = log.user_id.toString()
      io.to(userId).emit("new_notification", log)
    } else {
      console.error("Invalid log data: user_id is missing.")
    }

    return log
  } catch (error) {
    console.error("Error creating log:", error.message)
    throw new Error("Could not create log")
  }
}

// Fetch logs for a specific user
exports.getLogs = async (req, res) => {
  try {
    if (!req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const logs = await Log.find({ user_id: req.user.id })
      .sort({ seen: 1, createdAt: -1 }) // Unseen logs first, then by creation time
      .limit(50) // Pagination can be added later

    res.status(200).json(logs)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching logs",
    })
  }
}

// Mark a log as seen
exports.markLogAsSeen = async (req, res) => {
  try {
    const { log_id } = req.params

    const log = await Log.findByIdAndUpdate(
      log_id,
      { seen: true },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: "Log marked as seen",
      data: log,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking log as seen",
    })
  }
}

// Delete a log
exports.deleteLog = async (req, res) => {
  try {
    const { log_id } = req.params

    await Log.findByIdAndDelete(log_id)

    res.status(200).json({
      success: true,
      message: "Log deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting log",
    })
  }
}
