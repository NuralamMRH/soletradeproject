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
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Category",
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
  foreignField: "brandId",
});
soleCheckBrandSchema.virtual("labels", {
  ref: "SoleCheckLabel",
  localField: "_id",
  foreignField: "brandId",
});

exports.SoleCheckBrand = mongoose.model("SoleCheckBrand", soleCheckBrandSchema);
