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
    indicatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Indicator", // status: 'Just Dropped',
      default: "",
    },
    isIndicatorActive: {
      type: Boolean,
      default: false,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    subBrandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubBrand",
      required: false,
    },
    model: {
      type: String,
      default: "",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false,
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
    addToCalendar: {
      type: Boolean,
      default: false,
    },
    calenderDateTime: {
      type: Date,
      default: null,
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
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    indicatorDuration: {
      type: Number,
      default: 0,
    },
    numberOfStocks: {
      type: Number,
      default: 1,
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

productSchema.virtual("indicator", {
  ref: "Indicator",
  localField: "indicatorId",
  foreignField: "_id",
  justOne: true,
});
productSchema.virtual("brand", {
  ref: "Brand",
  localField: "brandId",
  foreignField: "_id",
  justOne: true,
});
productSchema.virtual("subBrand", {
  ref: "SubBrand",
  localField: "subBrandId",
  foreignField: "_id",
  justOne: true,
});
productSchema.virtual("category", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

productSchema.virtual("subCategory", {
  ref: "SubCategory",
  localField: "subCategoryId",
  foreignField: "_id",
  justOne: true,
});
productSchema.virtual("attribute", {
  ref: "Attribute",
  localField: "attributeId",
  foreignField: "_id",
  justOne: true,
});

// Add any existing indexes
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

exports.Product = mongoose.model("Product", productSchema);
