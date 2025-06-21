const mongoose = require("mongoose");

const soleCheckTopUpSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  credit: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: "",
  },
  image_full_url: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

soleCheckTopUpSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckTopUpSchema.set("toJSON", {
  virtuals: true,
});

exports.SoleCheckTopUp = mongoose.model("SoleCheckTopUp", soleCheckTopUpSchema);
