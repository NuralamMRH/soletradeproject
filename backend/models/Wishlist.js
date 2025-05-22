const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

wishlistSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

wishlistSchema.set("toJSON", {
  virtuals: true,
});

exports.Wishlist = mongoose.model("Wishlist", wishlistSchema);
