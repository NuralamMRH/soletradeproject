const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["general", "sole-check"],
    default: "general",
  },
  name: {
    type: String,
    required: true,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
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

// To include the virtuals when converting to JSON or Object
categorySchema.set("toObject", { virtuals: true });
categorySchema.set("toJSON", { virtuals: true });

categorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

categorySchema.set("toJSON", {
  virtuals: true,
});

categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "parentCategory",
});

categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  justOne: false,
});

exports.Category = mongoose.model("Category", categorySchema);
