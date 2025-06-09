const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByUser,
} = require("../controllers/orderController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.get(`/`, getAllOrders);
router.get("/:id", isAuthenticatedUser, getOrderById);
router.post("/", isAuthenticatedUser, createOrder);
router.put("/:id", isAuthenticatedUser, updateOrder);
router.delete("/:id", isAuthenticatedUser, deleteOrder);

module.exports = router;
