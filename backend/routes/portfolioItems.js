const express = require("express");
const router = express.Router();
const {
  getAllPortfolioItems,
  getPortfolioItemById,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioItemsByUser,
  deleteManyPortfolioItems,
} = require("../controllers/portfolioItemController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllPortfolioItems);
router.route("/:id").get(getPortfolioItemById);
router.route("/").post(isAuthenticatedUser, createPortfolioItem);
router.route("/:id").put(isAuthenticatedUser, updatePortfolioItem);
router.route("/:id").delete(isAuthenticatedUser, deletePortfolioItem);
router.route("/me").get(isAuthenticatedUser, getPortfolioItemsByUser);
router
  .route("/remove-many")
  .post(isAuthenticatedUser, deleteManyPortfolioItems);

module.exports = router;
