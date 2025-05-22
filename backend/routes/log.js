const express = require("express");
const { getLogs } = require("../controllers/log/logController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const router = express.Router();

router.route("/me/logs").get(isAuthenticatedUser, getLogs);

module.exports = router;
