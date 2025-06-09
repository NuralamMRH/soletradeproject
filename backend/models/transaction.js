const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  biddingOfferId: { type: mongoose.Schema.Types.ObjectId, ref: "BiddingOffer" }, // optional
  sellingItemId: { type: mongoose.Schema.Types.ObjectId, ref: "SellingItem" }, // optional
  price: { type: Number, required: true },
  status: { type: String, default: "Pending" }, // or Completed, Cancelled, etc.
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

transactionSchema.set("toJSON", {
  virtuals: true,
});

transactionSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("biddingOffer", {
  ref: "BiddingOffer",
  localField: "biddingOfferId",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("sellingItem", {
  ref: "SellingItem",
  localField: "sellingItemId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Transaction", transactionSchema);
