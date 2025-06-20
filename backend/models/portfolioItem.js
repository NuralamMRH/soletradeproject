const mongoose = require("mongoose");

const portfolioItemSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  itemCondition: {
    type: String,
    default: "New",
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  purchaseAt: {
    type: Date,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

portfolioItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

portfolioItemSchema.set("toJSON", {
  virtuals: true,
});

portfolioItemSchema.virtual("size", {
  ref: "AttributeOption",
  localField: "sizeId",
  foreignField: "_id",
  justOne: true,
});

portfolioItemSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});




exports.PortfolioItem = mongoose.model("PortfolioItem", portfolioItemSchema);
