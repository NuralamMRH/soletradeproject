const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderType: {
    type: String,
    default: "Offer",
    required: true,
  },
  orderStatus: {
    type: String,
    default: "Sold",
  },

  offerPrice: {
    type: Number,
  },
  sellerOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellingItem",
  },
  buyerOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BiddingOffer",
  },
  items: [],
  totalPrice: {
    type: Number,
    required: true,
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  sizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
  },
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipping",
  },
  itemCondition: {
    type: String,
    enum: ["New", "Used", "New with Defects"],
    default: "New",
  },
  packaging: {
    type: String,
    default: "Good Box",
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderCreatedAt: {
    type: Date,
    default: Date.now,
  },
  shippingStatus: {
    type: String,
    default: "Pending",
  },
  shippingDate: {
    type: Date,
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

orderSchema.virtual("sellerOffer", {
  ref: "SellingItem",
  localField: "sellerOfferId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("buyerOffer", {
  ref: "BiddingOffer",
  localField: "buyerOfferId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("voucher", {
  ref: "Voucher",
  localField: "voucherId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("shippingAddress", {
  ref: "Shipping",
  localField: "shippingAddressId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("paymentMethod", {
  ref: "PaymentMethod",
  localField: "paymentMethodId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("size", {
  ref: "AttributeOption",
  localField: "sizeId",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

exports.Order = mongoose.model("Order", orderSchema);
