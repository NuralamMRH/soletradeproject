const mongoose = require("mongoose");

const attributeOptionSchema = mongoose.Schema(
  {
    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },
    optionName: {
      type: String,
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

attributeOptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual for lowestAsk
attributeOptionSchema.virtual("lowestAsk", {
  ref: "SellingItem",
  localField: "_id",
  foreignField: "selectedAttributeId",
  match: { status: "Pending", sellingType: "Ask" },
  options: { sort: { sellingPrice: 1 }, limit: 1 },
  justOne: true,
  get: function () {
    if (this.populated("lowestAsk")) {
      return this.lowestAsk?.sellingPrice || null;
    }
    return null;
  },
});

// Virtual for highestOffer
attributeOptionSchema.virtual("highestOffer", {
  ref: "BiddingOffer",
  localField: "_id",
  foreignField: "selectedAttributeId",
  match: { biddingStatus: "Active", biddingType: "Offer" },
  options: { sort: { offeredPrice: -1 }, limit: 1 },
  justOne: true,
  get: function () {
    if (this.populated("highestOffer")) {
      return this.highestOffer?.offeredPrice || null;
    }
    return null;
  },
});

// Index for better query performance
attributeOptionSchema.index({ attributeId: 1 });
attributeOptionSchema.index({ optionName: 1 });

exports.AttributeOption = mongoose.model(
  "AttributeOption",
  attributeOptionSchema
);
