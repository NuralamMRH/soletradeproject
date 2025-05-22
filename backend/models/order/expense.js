const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: "Order" },
  vendor_id: { type: Schema.Types.ObjectId, ref: "Vendor" },
  amount: { type: Number },
  created_at: { type: Date, default: Date.now },
});

// Relationships
ExpenseSchema.virtual("vendor", {
  ref: "Vendor",
  localField: "_id",
  foreignField: "_id",
  justOne: true,
});

ExpenseSchema.virtual("order", {
  ref: "Order",
  localField: "order_id",
  foreignField: "_id",
  justOne: true,
});

ExpenseSchema.virtual("delivery_man", {
  ref: "DeliveryMan",
  localField: "delivery_man_id",
  foreignField: "_id",
  justOne: true,
});

ExpenseSchema.virtual("user", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Expense", ExpenseSchema);
