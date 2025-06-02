const mongoose = require("mongoose");
const { Schema } = mongoose;

const VoucherSectionSchema = new Schema(
  {
    name: { type: String, required: true },
    voucherIds: [
      {
        voucher: { type: Schema.Types.ObjectId, ref: "Voucher" },
        position: { type: Number, required: true },
      },
    ],
    term: { type: String, default: "one-time" },
  },
  { timestamps: true }
);

VoucherSectionSchema.index({ term: 1 }, { unique: true });

module.exports = mongoose.model("VoucherSection", VoucherSectionSchema);
