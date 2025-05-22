const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderTransactionSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: "Order" },
  admin_expense: { type: Number, default: 0 },
  vendor_expense: { type: Number, default: 0 },
  commission_percentage: { type: Number, default: 0 },
  discount_amount_by_restaurant: { type: Number, default: 0 },
  additional_charge: { type: Number, default: 0 },
  is_subscribed: { type: Boolean, default: false },
});

module.exports = mongoose.model("OrderTransaction", OrderTransactionSchema);
