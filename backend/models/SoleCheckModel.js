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
  soleCheckBrand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckBrand",
  },
});

soleCheckModelSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckModelSchema.set("toJSON", {
  virtuals: true,
});

exports.SoleCheckModel = mongoose.model("SoleCheckModel", soleCheckModelSchema);
