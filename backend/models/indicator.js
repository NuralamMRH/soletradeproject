const mongoose = require("mongoose");

const indicatorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  image_full_url: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

indicatorSchema.set("toObject", { virtuals: true });
indicatorSchema.set("toJSON", { virtuals: true });

indicatorSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

indicatorSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "indicator",
});

exports.Indicator = mongoose.model("Indicator", indicatorSchema);
