const mongoose = require("mongoose");

// Main SoleCheck Suggestions Schema
const soleCheckSuggestionsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckBrand",
    default: null,
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleCheckModel",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

soleCheckSuggestionsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

soleCheckSuggestionsSchema.set("toJSON", {
  virtuals: true,
});

exports.SoleCheckSuggestion = mongoose.model(
  "SoleCheckSuggestion",
  soleCheckSuggestionsSchema
);
