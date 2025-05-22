const mongoose = require("mongoose");

const attributeSchema = mongoose.Schema({
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
});

attributeSchema.set("toObject", { virtuals: true });
attributeSchema.set("toJSON", { virtuals: true });

attributeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

attributeSchema.virtual("options", {
  ref: "AttributeOption",
  localField: "_id",
  foreignField: "attributeId",
});

exports.Attribute = mongoose.model("Attribute", attributeSchema);
