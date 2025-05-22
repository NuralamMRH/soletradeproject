const mongoose = require("mongoose");

const tierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter tier name"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please specify tier type"],
      enum: ["buyer", "seller"],
    },
    spendingRequired: {
      type: Number,
      required: [true, "Please enter spending amount required"],
      default: 0,
    },
    ordersRequired: {
      type: Number,
      required: [true, "Please enter number of orders required"],
      default: 0,
    },
    timeLimit: {
      type: Date,
      required: [true, "Please specify time limit"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

tierSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

tierSchema.set("toJSON", {
  virtuals: true,
});

tierSchema.virtual("benefits", {
  ref: "TierBenefit",
  localField: "_id",
  foreignField: "tier_id",
});

tierSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "tierIds",
});

module.exports = mongoose.model("Tier", tierSchema);
