const mongoose = require("mongoose");

const homeFeedSectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    number_of_items: {
      type: Number,
    },
    items_per_column: {
      type: Number,
      default: 3,
    },
    column_count: {
      type: Number,
      default: 2,
    },
    column_names: {
      type: Object,
      default: {},
    },
    column_variables: {
      type: Object,
      default: {},
    },
    column_products: [
      {
        column: String,
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        ],
      },
    ],
    column_brands: [
      {
        column: String,
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
          },
        ],
      },
    ],
    column_categories: [
      {
        column: String,
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
          },
        ],
      },
    ],
    display_type: {
      type: String,
      // enum: ["new-items", "trending", "featured", "custom"],
      default: "new-items",
    },
    display_style: {
      type: Number,
      default: 1,
    },
    mode: {
      type: String,
      enum: ["auto", "manual"],
      required: true,
      default: "manual",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    // References to products, categories, and brands
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    variable_source: {
      type: String,
      enum: ["products", "categories", "brands"],
      default: "products",
    },
    // Auto-population criteria
    autoCriteria: {
      productType: {
        type: String,
        enum: ["essential", "auction", "deal", "all"],
        default: "all",
      },
      sortBy: {
        type: String,
        // enum: ["newest", "popular", "price-asc", "price-desc", "rating"],
        default: "newest",
      },
      minRating: {
        type: Number,
        default: 0,
      },
      priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

homeFeedSectionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual for populated products
homeFeedSectionSchema.virtual("populatedProducts", {
  ref: "Product",
  localField: "products",
  foreignField: "_id",
  justOne: false,
});

// Virtual for populated categories
homeFeedSectionSchema.virtual("populatedCategories", {
  ref: "Category",
  localField: "categories",
  foreignField: "_id",
  justOne: false,
});

// Virtual for populated brands
homeFeedSectionSchema.virtual("populatedBrands", {
  ref: "Brand",
  localField: "brands",
  foreignField: "_id",
  justOne: false,
});

// Indexes for better query performance
homeFeedSectionSchema.index({ isActive: 1, order: 1 });
homeFeedSectionSchema.index({ display_type: 1 });
homeFeedSectionSchema.index({ mode: 1 });

const HomeFeedSection = mongoose.model(
  "HomeFeedSection",
  homeFeedSectionSchema
);

module.exports = HomeFeedSection;
