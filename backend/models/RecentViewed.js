const mongoose = require("mongoose");

const RecentViewedSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RecentViewedSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

RecentViewedSchema.set("toJSON", {
  virtuals: true,
});

RecentViewedSchema.index({ userId: 1, productId: 1 }, { unique: true });
RecentViewedSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

exports.RecentViewed = mongoose.model("RecentViewed", RecentViewedSchema);
