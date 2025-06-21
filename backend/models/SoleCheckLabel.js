const mongoose = require("mongoose");

const soleCheckLabelSchema = mongoose.Schema({
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
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckBrand",
    default: null,
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckModel",
    default: null,
  },
  forAllSelectedBrands: {
    type: Boolean,
    default: false,
  },
  forAllSelectedModels: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

soleCheckLabelSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckLabelSchema.set("toJSON", {
  virtuals: true,
});

soleCheckLabelSchema.virtual("soleCheckBrand", {
  ref: "SoleCheckBrand",
  localField: "soleCheckBrandId",
  foreignField: "_id",
  justOne: true,
});

soleCheckLabelSchema.virtual("soleCheckCategory", {
  ref: "SoleCheckCategory",
  localField: "soleCheckCategoryId",
  foreignField: "_id",
  justOne: true,
});

soleCheckLabelSchema.virtual("soleCheckModel", {
  ref: "SoleCheckModel",
  localField: "modelId",
  foreignField: "_id",
  justOne: true,
});

exports.SoleCheckLabel = mongoose.model("SoleCheckLabel", soleCheckLabelSchema);
