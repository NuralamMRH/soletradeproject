const mongoose = require("mongoose");

const soleCheckModelSchema = mongoose.Schema({
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
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckBrand",
    default: null,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckCategory",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

soleCheckModelSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckModelSchema.set("toJSON", {
  virtuals: true,
});

soleCheckModelSchema.virtual("brands", {
  ref: "SoleCheckBrand",
  localField: "brandId",
  foreignField: "_id",
});

soleCheckModelSchema.virtual("categories", {
  ref: "SoleCheckCategory",
  localField: "categoryId",
  foreignField: "_id",
});

soleCheckModelSchema.virtual("labels", {
  ref: "SoleCheckLabel",
  localField: "_id",
  foreignField: "modelId",
  justOne: false,
});

exports.SoleCheckModel = mongoose.model("SoleCheckModel", soleCheckModelSchema);
