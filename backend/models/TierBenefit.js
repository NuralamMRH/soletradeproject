const mongoose = require("mongoose");

const tierBenefitSchema = new mongoose.Schema(
  {
    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    sellerFee: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    buyerFee: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    icon: {
      type: String,
    },
    icon_full_url: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

tierBenefitSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

tierBenefitSchema.set("toJSON", {
  virtuals: true,
});

tierBenefitSchema.virtual("tierInfo", {
  ref: "Tiers",
  localField: "tier",
  foreignField: "_id",
});

module.exports = mongoose.model("TierBenefit", tierBenefitSchema);
