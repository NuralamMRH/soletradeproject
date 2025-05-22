const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    product_type: {
      type: String,
      enum: ["essential", "auction", "deal"],
      default: "deal", // Default role
    },
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
    },
    richDescription: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    image_full_url: {
      type: String,
      default: "",
    },
    images: [],
    indicator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Indicator", // status: 'Just Dropped',
      default: "",
    },
    isIndicatorActive: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    model: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    attributeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
    },

    variations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttributeOption",
      },
    ],
    sku: {
      type: String,
      default: "",
    },
    indicator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Indicator", // status: 'Just Dropped',
    },
    colorway: {
      type: String,
      default: "",
    },
    mainColor: {
      type: String,
      default: "",
    },
    retailPrice: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numViews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isCalenderActive: {
      type: Boolean,
      default: false,
    },
    sellerFee: {
      type: Number,
      default: 0,
    },
    buyerFee: {
      type: Number,
      default: 0,
    },
    feeStartDate: {
      type: Date,
      default: null,
    },
    feeEndDate: {
      type: Date,
      default: null,
    },
    tierIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TiersBenefit",
      },
    ],
    publishDate: {
      type: Date,
      default: Date.now,
    },
    lunchDate: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      default: 0,
    },
    duration_icon: {
      type: String,
      default: "",
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    isUnpublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual for variationsData
productSchema.virtual("variationsData", {
  ref: "AttributeOption",
  localField: "variations",
  foreignField: "_id",
  justOne: false,
  options: {
    select: "name attributeId",
    populate: [
      {
        path: "attributeId",
        select: "name",
      },
      {
        path: "lowestAsk",
        select: "sellingPrice",
      },
      {
        path: "highestOffer",
        select: "offeredPrice",
      },
    ],
  },
});

// Add any existing indexes
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

exports.Product = mongoose.model("Product", productSchema);
