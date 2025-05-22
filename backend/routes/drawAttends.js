const express = require("express");
const router = express.Router();
const {
  getAllDrawAttends,
  getDrawAttendById,
  createDrawAttend,
  updateDrawAttend,
  deleteDrawAttend,
  getDrawAttendsByUser,
  getDrawAttendsByProduct,
} = require("../controllers/drawAttendController");

router.route("/").get(getAllDrawAttends);
router.route("/:id").get(getDrawAttendById);
router.route("/").post(createDrawAttend);
router.route("/:id").put(updateDrawAttend);
router.route("/:id").delete(deleteDrawAttend);
router.route("/user/:userId").get(getDrawAttendsByUser);
router.route("/product/:productId").get(getDrawAttendsByProduct);

module.exports = router;
