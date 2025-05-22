const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    image_full_url: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Poster", posterSchema);
