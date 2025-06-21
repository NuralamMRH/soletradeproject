const mongoose = require("mongoose");

const soleCheckAuthServiceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  credit: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 0,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

soleCheckAuthServiceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckAuthServiceSchema.set("toJSON", {
  virtuals: true,
});

exports.SoleCheckAuthService = mongoose.model(
  "SoleCheckAuthService",
  soleCheckAuthServiceSchema
);
