const mongoose = require("mongoose");

const subBrandSchema = mongoose.Schema({
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
  parentBrand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
});

subBrandSchema.set("toObject", { virtuals: true });
subBrandSchema.set("toJSON", { virtuals: true });

subBrandSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subBrandSchema.set("toJSON", {
  virtuals: true,
});

exports.SubBrand = mongoose.model("SubBrand", subBrandSchema);
