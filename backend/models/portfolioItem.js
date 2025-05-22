const mongoose = require("mongoose");

const portfolioItemSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: {
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

exports.PortfolioItem = mongoose.model("PortfolioItem", portfolioItemSchema);
