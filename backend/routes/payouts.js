const express = require("express");
const router = express.Router();
const {
  getAllPayouts,
  getPayoutById,
  createPayout,
  updatePayout,
  deletePayout,
  getPayoutsByUser,
} = require("../controllers/payoutController");

router.get(`/`, getAllPayouts);
router.get("/:id", getPayoutById);
router.post("/", createPayout);
router.put("/:id", updatePayout);
router.delete("/:id", deletePayout);
router.get("/user/:userId", getPayoutsByUser);

module.exports = router;
