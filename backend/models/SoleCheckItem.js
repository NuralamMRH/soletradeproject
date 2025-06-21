const mongoose = require("mongoose");

const soleCheckItemSchema = mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckBrand",
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckModel",
  },
  images: [],
  additionalImages: [],
  isNoBox: {
    type: Boolean,
    default: false,
  },
  remarks: {
    type: String,
    default: "",
  },
  authServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuthService",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["Authentic", "Fake", "Inconclusive"],
    default: "Inconclusive",
  },
  comment: {
    type: String,
    default: "",
  },
  statusChangedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
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

soleCheckItemSchema.virtual("authService", {
  ref: "AuthService",
  localField: "authServiceId",
  foreignField: "_id",
  justOne: true,
});

soleCheckItemSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

soleCheckItemSchema.virtual("brand", {
  ref: "SoleCheckBrand",
  localField: "brandId",
  foreignField: "_id",
  justOne: true,
});

soleCheckItemSchema.virtual("model", {
  ref: "SoleCheckModel",
  localField: "modelId",
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
