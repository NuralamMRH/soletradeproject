const mongoose = require("mongoose");

const biddingOfferSchema = mongoose.Schema({
  biddingType: {
    type: String,
    default: "Offer",
    required: true,
  },
  biddingStatus: {
    type: String,
    enum: ["Active", "Sold", "Banned"],
    default: "Active",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sellerOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellingItem",
  },
  itemCondition: {
    type: String,
    enum: ["New", "Used", "New with Defects"],
    default: "New",
  },
  packaging: {
    type: String,
    default: "Good",
  },
  selectedAttributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  offeredPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  offerCreateDate: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
  paymentDate: {
    type: Date,
  },
  shippingStatus: {
    type: String,
    default: "Pending",
  },
  shippingLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipping",
  },
});

biddingOfferSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

biddingOfferSchema.set("toJSON", {
  virtuals: true,
});

exports.BiddingOffer = mongoose.model("BiddingOffer", biddingOfferSchema);
