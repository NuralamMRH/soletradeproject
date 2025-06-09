const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionById);
router.post("/", isAuthenticatedUser, transactionController.createTransaction);
router.put(
  "/:id",
  isAuthenticatedUser,
  transactionController.updateTransaction
);
router.delete(
  "/:id",
  isAuthenticatedUser,
  transactionController.deleteTransaction
);
router.get(
  "/me",
  isAuthenticatedUser,
  transactionController.getTransactionsByUser
);
router.get(
  "/product/:productId",
  transactionController.getTransactionsByProduct
);

module.exports = router;
