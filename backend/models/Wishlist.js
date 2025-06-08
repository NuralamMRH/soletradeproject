const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  wishlistType: {
    type: String,
    enum: ["wishlist", "cart", "calender"],
    default: "wishlist",
  },
  pushNotified: {
    type: Boolean,
    default: false,
  },
  emailNotified: {
    type: Boolean,
    default: false,
  },
  smsNotified: {
    type: Boolean,
    default: false,
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

wishlistSchema.index({ user: 1, productId: 1 }, { unique: true });
wishlistSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

exports.Wishlist = mongoose.model("Wishlist", wishlistSchema);
