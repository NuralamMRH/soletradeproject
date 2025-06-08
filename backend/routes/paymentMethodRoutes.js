const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middlewares/auth");
const {
  getAllPaymentMethods,
  createPaymentMethod,
  getMyPaymentMethods,
  deletePaymentMethod,
  updatePaymentMethod,
  getByIdPaymentMethod,
  setDefaultPaymentMethod,
} = require("../controllers/paymentController");

router
  .route("/")
  .get(getAllPaymentMethods)
  .post(isAuthenticatedUser, createPaymentMethod);

router.route("/me").get(isAuthenticatedUser, getMyPaymentMethods);

router
  .route("/:id")
  .get(getByIdPaymentMethod)
  .put(isAuthenticatedUser, updatePaymentMethod)
  .delete(isAuthenticatedUser, deletePaymentMethod);

router.route("/:id/default").put(isAuthenticatedUser, setDefaultPaymentMethod);

module.exports = router;
