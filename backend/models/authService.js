const mongoose = require("mongoose");

const authServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  serviceDetails: {
    type: String,
    required: true,
    trim: true,
  },
  estimatedTime: {
    type: String,
    required: true,
    trim: true,
  },
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
  isActive: {
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

// Update the updatedAt timestamp before saving
authServiceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("AuthService", authServiceSchema);
