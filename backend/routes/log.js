const express = require("express");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { getLogs, getAllLogs } = require("../controllers/log/logController");
const router = express.Router();

router.route("/me").get(isAuthenticatedUser, getLogs);
router.route("/admin").get(getAllLogs);

module.exports = router;
