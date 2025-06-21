const express = require("express");
const router = express.Router();

const {
  getAllSoleCheckSuggestions,
  getSoleCheckSuggestionById,
  createSoleCheckSuggestion,
  deleteSoleCheckSuggestion,
  deleteManySoleCheckSuggestions,
  updateSoleCheckSuggestion,
} = require("../controllers/soleCheckSuggestionController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(getAllSoleCheckSuggestions);
router.route("/:id").get(getSoleCheckSuggestionById);
router.route("/").post(isAuthenticatedUser, createSoleCheckSuggestion);

router
  .route("/:id")
  .put(isAuthenticatedUser, updateSoleCheckSuggestion)
  .delete(isAuthenticatedUser, deleteSoleCheckSuggestion);

router
  .route("/delete-many")
  .delete(isAuthenticatedUser, deleteManySoleCheckSuggestions);

module.exports = router;
