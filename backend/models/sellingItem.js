const mongoose = require("mongoose");

const sellingSchema = mongoose.Schema({
  sellingType: {
    type: String,
    default: "Ask",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  bidderOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BiddingOffer",
  },
  itemCondition: {
    type: String,
    default: "Ready to Ship Items",
  },
  packaging: {
    type: String,
    default: "Good Box",
  },
  selectedAttributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  sellingCommission: {
    type: Number,
  },
  sellerFee: {
    type: Number,
  },
  earnings: {
    type: Number,
  },
  cashOutFee: {
    type: Number,
  },
  finalCashOutAmount: {
    type: Number,
  },
  status: {
    type: String,
    default: "Active",
  },
  itemVerification: {
    type: String,
    default: "Verified",
  },
  sellingAt: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    default: null,
  },
  images: [
    {
      type: String,
    },
  ],
});

sellingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sellingSchema.set("toJSON", {
  virtuals: true,
});

exports.SellingItem = mongoose.model("SellingItem", sellingSchema);
