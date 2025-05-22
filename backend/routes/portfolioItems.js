const express = require("express");
const router = express.Router();
const {
  getAllPortfolioItems,
  getPortfolioItemById,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioItemsByUser,
} = require("../controllers/portfolioItemController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllPortfolioItems);
router.route("/:id").get(getPortfolioItemById);
router.route("/").post(isAuthenticatedUser, createPortfolioItem);
router.route("/:id").put(isAuthenticatedUser, updatePortfolioItem);
router.route("/:id").delete(isAuthenticatedUser, deletePortfolioItem);
router.route("/user").get(isAuthenticatedUser, getPortfolioItemsByUser);

module.exports = router;
