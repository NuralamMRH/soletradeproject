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
  totalPrice: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
  },
  sellerOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellingItem",
  },
  mainProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
  },
  billingAddress1: {
    type: String,
  },
  billingAddress2: {
    type: String,
  },
  city: {
    type: String,
  },
  zip: {
    type: String,
  },
  country: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderCreateAt: {
    type: Date,
    default: Date.now,
  },
  shippingStatus: {
    type: String,
    default: "Pending",
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("Order", orderSchema);

/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */
