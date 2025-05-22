const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
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
});
brandSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// To include the virtuals when converting to JSON or Object
brandSchema.set("toObject", { virtuals: true });
brandSchema.set("toJSON", { virtuals: true });

brandSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

brandSchema.set("toJSON", {
  virtuals: true,
});

brandSchema.virtual("subBrands", {
  ref: "SubBrand",
  localField: "_id",
  foreignField: "parentBrand",
});

exports.Brand = mongoose.model("Brand", brandSchema);
