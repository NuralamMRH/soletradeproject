const mongoose = require("mongoose");

const biddingOfferSchema = mongoose.Schema({
  type: {
    type: String,
    default: "Offer",
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Sold", "Banned"],
    default: "Active",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
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
  sizeId: {
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
  deliverySystem: {
    type: String,
    default: "Standard",
  },
  offerCreateDate: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
  },
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentMethod",
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
  shippingAddressId: {
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

biddingOfferSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

biddingOfferSchema.virtual("seller", {
  ref: "User",
  localField: "sellerId",
  foreignField: "_id",
  justOne: true,
});

biddingOfferSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

biddingOfferSchema.virtual("size", {
  ref: "AttributeOption",
  localField: "sizeId",
  foreignField: "_id",
  justOne: true,
});

biddingOfferSchema.virtual("paymentMethod", {
  ref: "PaymentMethod",
  localField: "paymentMethodId",
  foreignField: "_id",
  justOne: true,
});

biddingOfferSchema.virtual("shippingAddress", {
  ref: "Shipping",
  localField: "shippingAddressId",
  foreignField: "_id",
  justOne: true,
});

biddingOfferSchema.set("toObject", { virtuals: true });

exports.BiddingOffer = mongoose.model("BiddingOffer", biddingOfferSchema);
