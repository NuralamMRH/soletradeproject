const mongoose = require("mongoose");

// Schema for image upload requirements
const imageRequirementSchema = new mongoose.Schema({
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  ],
  brands: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SoleCheckBrand",
      required: true,
    },
  ],
  models: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SoleCheckModel",
      required: true,
    },
  ],
  requiredImages: [
    {
      name: String,
      description: String,
      image: String,
      image_full_url: String,
      isRequired: {
        type: Boolean,
        default: true,
      },
    },
  ],
  enableNoBoxOption: {
    type: Boolean,
    default: false,
  },
  enableRemarks: {
    type: Boolean,
    default: false,
  },
  suggestions: [
    {
      text: String,
      order: Number,
    },
  ],
});

// Schema for authentication service packages
const authServicePackageSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  packages: [
    {
      name: String,
      timeLimit: {
        value: Number,
        unit: {
          type: String,
          enum: ["minutes", "hours"],
        },
      },
      credits: Number,
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

// Schema for topup packages
const topupPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["BASIC", "STANDARD", "PREMIUM", "ULTIMATE"],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Main SoleCheck Settings Schema
const soleCheckSettingSchema = new mongoose.Schema({
  imageRequirements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImageRequirement",
    },
  ],
  authServices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthService",
    },
  ],
  topupPackages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TopupPackage",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
soleCheckSettingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("SoleCheckSetting", soleCheckSettingSchema);
