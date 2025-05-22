const mongoose = require("mongoose");

const productVariationSchema = mongoose.Schema({
  attributeOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  itemCondition: {
    type: String,
    enum: ["New", "Used", "New with Defects"],
    default: "New",
  },
  basePrice: {
    type: Number,
    default: 0,
  },
  countInStock: {
    type: Number,
    default: 10,
  },
  conditionalImages: [
    {
      type: String,
    },
  ],
});

productVariationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productVariationSchema.set("toJSON", {
  virtuals: true,
});
