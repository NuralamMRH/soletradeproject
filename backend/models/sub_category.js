const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema({
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
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});
subCategorySchema.set("toObject", { virtuals: true });
subCategorySchema.set("toJSON", { virtuals: true });

subCategorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

exports.SubCategory = mongoose.model("SubCategory", subCategorySchema);
