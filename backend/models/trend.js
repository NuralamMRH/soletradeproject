const mongoose = require("mongoose");

const trendSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: false,
  },
  priceHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      price: {
        type: Number,
        required: true,
      },
      percentageChange: {
        type: Number,
        default: 0,
      },
    },
  ],
  changePercentage: {
    type: Number,
    default: 0,
  },
  popularity: {
    type: Number, // Rank or score for product popularity
    default: 0,
  },
  salesVolume: {
    type: Number,
    default: 0,
  },
  searchCount: {
    type: Number,
    default: 0,
  },
  isHot: {
    type: Boolean,
    default: false,
  },
  isRising: {
    type: Boolean,
    default: false,
  },
  isFalling: {
    type: Boolean,
    default: false,
  },
  isStable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

trendSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

trendSchema.set("toJSON", {
  virtuals: true,
});

exports.Trend = mongoose.model("Trend", trendSchema);
