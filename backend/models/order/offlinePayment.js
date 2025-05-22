const mongoose = require("mongoose");
const { Schema } = mongoose;

const OfflinePaymentsSchema = new Schema(
  {
    order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfflinePayments", OfflinePaymentsSchema);
