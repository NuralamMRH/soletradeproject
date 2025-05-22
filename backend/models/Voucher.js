const mongoose = require("mongoose");
const { Schema } = mongoose;

const VoucherSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    discountType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      required: true,
    },
    discountAmount: { type: Number, required: true },
    maxDiscount: { type: Number },
    minSpend: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    appliesToEntireApp: { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: "category" }],
    subCategories: [{ type: Schema.Types.ObjectId, ref: "sub_category" }],
    brands: [{ type: Schema.Types.ObjectId, ref: "brand" }],
    subBrands: [{ type: Schema.Types.ObjectId, ref: "sub_brand" }],
    attributes: [{ type: Schema.Types.ObjectId, ref: "attribute" }],
    tiers: [{ type: Schema.Types.ObjectId, ref: "Tier" }],
    totalIssued: { type: Number, required: true },
    limitPerCustomer: { type: Number, default: 1 },
    shipmentMethods: [{ type: String }],
    paymentMethods: [{ type: String }],
    orderTypes: [{ type: String }],
    terms: [{ type: String }],
    poster: { type: Schema.Types.ObjectId, ref: "Poster" },
    status: { type: String, enum: ["Ongoing", "Expired"], default: "Ongoing" },
    isWeeklyVoucher: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VoucherSchema.pre("save", function (next) {
  if (
    this.isWeeklyVoucher === false &&
    this.endDate &&
    new Date(this.endDate) < new Date()
  ) {
    this.status = "Expired";
  }
  next();
});

// Also handle updates (for findOneAndUpdate, findByIdAndUpdate, etc.)
VoucherSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  // If isWeeklyVoucher is false and endDate is in the past, set status to Expired
  if (
    update &&
    update.isWeeklyVoucher === false &&
    update.endDate &&
    new Date(update.endDate) < new Date()
  ) {
    update.status = "Expired";
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model("Voucher", VoucherSchema);
