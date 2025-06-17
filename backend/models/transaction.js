const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
  type: { type: String, required: true }, // Offer, BuyNow, etc.
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  biddingOfferId: { type: mongoose.Schema.Types.ObjectId, ref: "BiddingOffer" }, // optional
  sellingItemId: { type: mongoose.Schema.Types.ObjectId, ref: "SellingOffer" }, // optional
  sizeId: { type: mongoose.Schema.Types.ObjectId, ref: "AttributeOption" },
  sizeName: { type: String, default: "" },
  price: { type: Number, required: true },
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentMethod",
  },
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipping",
  },
  productImage: { type: String, default: "" },
  deliverySystem: { type: String, default: "Standard" },
  packaging: { type: String, default: "" },
  itemCondition: { type: String, default: "" },
  deliveryFee: { type: Number, default: 0 },
  deliveryStatus: { type: String, default: "Pending" },
  deliveryTrackingNumber: { type: String, default: "" },
  deliveryTrackingUrl: { type: String, default: "" },
  deliveryTrackingStatus: { type: String, default: "Pending" },
  deliveryTrackingStatusDescription: { type: String, default: "" },
  status: { type: String, default: "Pending" }, // or Completed, Cancelled, etc.
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

transactionSchema.set("toJSON", {
  virtuals: true,
});

transactionSchema.virtual("buyer", {
  ref: "User",
  localField: "buyerId",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("seller", {
  ref: "User",
  localField: "sellerId",
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
  ref: "SellingOffer",
  localField: "sellingItemId",
  foreignField: "_id",
  justOne: true,
});
transactionSchema.virtual("paymentMethod", {
  ref: "PaymentMethod",
  localField: "paymentMethodId",
  foreignField: "_id",
  justOne: true,
});
transactionSchema.virtual("shippingAddress", {
  ref: "Shipping",
  localField: "shippingAddressId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Transaction", transactionSchema);
