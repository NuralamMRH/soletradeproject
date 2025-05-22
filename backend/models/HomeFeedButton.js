const mongoose = require("mongoose");

const homeFeedButtonSchema = mongoose.Schema({
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
  design: {
    type: String,
    default: "filled",
  },
  link: {
    type: String,
    default: "",
  },
  linkType: {
    type: String,
    enum: ["internal", "external"],
    default: "internal",
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

homeFeedButtonSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

homeFeedButtonSchema.set("toJSON", {
  virtuals: true,
});

homeFeedButtonSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "indicator",
});

exports.HomeFeedButton = mongoose.model("HomeFeedButton", homeFeedButtonSchema);
