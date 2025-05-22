const express = require("express");
const router = express.Router();
const {
  getAllBiddingOffers,
  getBiddingOfferById,
  createBiddingOffer,
  updateBiddingOffer,
  deleteBiddingOffer,
  getBiddingOfferCount,
  getUserBiddingOffers,
  getProductBiddingOffers,
  getProductBiddingOffersByAttribute,
  getAttributeOptionBiddingOffers,
} = require("../controllers/biddingOfferController");
const { isAuthenticatedUser } = require("../middlewares/auth");

// Get all bidding offers with pagination, search, and filter
router.get("/", getAllBiddingOffers);

// Get a single bidding offer by ID
router.get("/:id", getBiddingOfferById);

// Create a new bidding offer
router.post("/", createBiddingOffer);

// Update a bidding offer
router.put("/:id", updateBiddingOffer);

// Delete a bidding offer
router.delete("/:id", deleteBiddingOffer);

// Get total count of bidding offers
router.get("/get/count", getBiddingOfferCount);

// Get all bidding offers for a specific user
router.get("/get/useroffer", isAuthenticatedUser, getUserBiddingOffers);

// Get all bidding offers for a specific product
router.get("/get/product/:productId", getProductBiddingOffers);

// Get all bidding offers for a specific product and attribute
router.get(
  "/get/product/:productId/:selectedAttributeId",
  getProductBiddingOffersByAttribute
);

// Get all bidding offers for a specific attribute option
router.get(
  "/get/attributeOption/:selectedAttributeId",
  getAttributeOptionBiddingOffers
);

module.exports = router;
