const mongoose = require("mongoose");

const soleCheckBrandSchema = mongoose.Schema({
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

soleCheckBrandSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckBrandSchema.set("toJSON", {
  virtuals: true,
});

soleCheckBrandSchema.virtual("models", {
  ref: "SoleCheckModel",
  localField: "_id",
  foreignField: "soleCheckBrand",
});

exports.SoleCheckBrand = mongoose.model("SoleCheckBrand", soleCheckBrandSchema);
