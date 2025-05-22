const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    street2: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      required: true,
    },
    subDistrict: {
      type: String,
      default: "",
    },
    province: {
      type: String,
      default: "",
    },
    postalCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to handle default address logic
shippingSchema.pre("save", async function (next) {
  try {
    // Only proceed if isDefault is being set to true
    if (this.isModified("isDefault") && this.isDefault === true) {
      // Find all shipping addresses for this user
      const Shipping = mongoose.model("Shipping");

      // Update all other addresses for this user to isDefault: false
      await Shipping.updateMany(
        {
          user: this.user,
          _id: { $ne: this._id }, // Exclude the current document
        },
        { isDefault: false }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-findOneAndUpdate middleware to handle default address logic for updates
shippingSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();

    // Only proceed if isDefault is being set to true
    if (update.isDefault === true) {
      const query = this.getQuery();

      // Find all shipping addresses for this user
      const Shipping = mongoose.model("Shipping");

      // Update all other addresses for this user to isDefault: false
      await Shipping.updateMany(
        {
          user: query.user,
          _id: { $ne: query._id }, // Exclude the current document
        },
        { isDefault: false }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

shippingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

shippingSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Shipping", shippingSchema);
exports.shippingSchema = shippingSchema;
