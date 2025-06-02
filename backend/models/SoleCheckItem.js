const mongoose = require("mongoose");

const soleCheckItemSchema = mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  subBrandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubBrand",
    required: false,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  appearanceImage: {
    type: String,
    default: "",
  },
  appearanceImage_full_url: {
    type: String,
    default: "",
  },
  insideLabelImage: {
    type: String,
    default: "",
  },
  insideLabelImage_full_url: {
    type: String,
    default: "",
  },
  insoleImage: {
    type: String,
    default: "",
  },
  insoleImage_full_url: {
    type: String,
    default: "",
  },
  insoleStitchImage: {
    type: String,
    default: "",
  },
  insoleStitchImage_full_url: {
    type: String,
    default: "",
  },
  boxLabelImage: {
    type: String,
    default: "",
  },
  boxLabelImage_full_url: {
    type: String,
    default: "",
  },
  dateCodeImage: {
    type: String,
    default: "",
  },
  dateCodeImage_full_url: {
    type: String,
    default: "",
  },
  additionalImages: [],
  remarks: {
    type: String,
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  checkedStatus: {
    type: String,
    default: "NOT PASS",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

soleCheckItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckItemSchema.set("toJSON", {
  virtuals: true,
});

soleCheckItemSchema.virtual("brand", {
  ref: "Brand",
  localField: "brandId",
  foreignField: "_id",
  justOne: true,
});

soleCheckItemSchema.virtual("subBrand", {
  ref: "SubBrand",
  localField: "subBrandId",
  foreignField: "_id",
  justOne: true,
});

soleCheckItemSchema.virtual("category", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

exports.SoleCheckItem = mongoose.model("SoleCheckItem", soleCheckItemSchema);
