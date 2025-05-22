const mongoose = require("mongoose");

const soleDrawSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  image_full_url: {
    type: String,
    default: "",
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

soleDrawSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleDrawSchema.set("toJSON", {
  virtuals: true,
});

exports.SoleDraw = mongoose.model("SoleDraw", soleDrawSchema);
