const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refundSchema = new Schema(
  {
    refund_amount: { type: Number },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Refund", refundSchema);
