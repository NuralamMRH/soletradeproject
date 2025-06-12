const mongoose = require("mongoose");

const sellingSchema = mongoose.Schema({
  type: {
    type: String,
    default: "Ask",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  itemCondition: {
    type: String,
    default: "Ready to Ship Items",
  },
  packaging: {
    type: String,
    default: "Good Box",
  },
  sizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  sizeName: {
    type: String,
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
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentMethod",
  },
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShippingAddress",
  },

  images: [],
});

sellingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sellingSchema.set("toJSON", {
  virtuals: true,
});

sellingSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

sellingSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

sellingSchema.virtual("size", {
  ref: "AttributeOption",
  localField: "sizeId",
  foreignField: "_id",
  justOne: true,
});

sellingSchema.virtual("buyer", {
  ref: "User",
  localField: "buyerId",
  foreignField: "_id",
  justOne: true,
});

sellingSchema.set("toObject", { virtuals: true });

exports.SellingOffer = mongoose.model("SellingOffer", sellingSchema);
