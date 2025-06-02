const mongoose = require("mongoose");
const { Schema } = mongoose;

const VoucherSchema = new Schema(
  {
    voucherType: {
      type: String,
      enum: ["Weekly", "One-Time"],
    },
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
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    subCategories: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
    brands: [{ type: Schema.Types.ObjectId, ref: "Brand" }],
    subBrands: [{ type: Schema.Types.ObjectId, ref: "SubBrand" }],
    attributes: [{ type: Schema.Types.ObjectId, ref: "Attribute" }],
    tiers: [{ type: Schema.Types.ObjectId, ref: "Tier" }],
    totalIssued: { type: Number, default: 0 },
    limitPerCustomer: { type: Number, default: 1 },
    shipmentMethods: [{ type: String }],
    paymentMethods: [{ type: String }],
    orderTypes: [{ type: String }],
    terms: [{ type: String }],
    posterId: { type: Schema.Types.ObjectId, ref: "Poster" },
    status: { type: String, enum: ["Ongoing", "Expired"], default: "Ongoing" },
    isWeeklyVoucher: { type: Boolean, default: false },
    brand: { type: String, required: false },
    image: { type: String, required: false },
    image_full_url: { type: String, required: false },
  },
  { timestamps: true }
);
VoucherSchema.set("toObject", { virtuals: true });
VoucherSchema.set("toJSON", { virtuals: true });

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

VoucherSchema.virtual("poster", {
  ref: "Poster",
  localField: "posterId",
  foreignField: "_id",
  justOne: true,
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
