const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartSchema = new Schema(
  {
    guest_id: { type: String, required: true },
    item_id: { type: Schema.Types.ObjectId, required: true },
    is_guest: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    variation: { type: [Object], default: [] },
    createdAt: { type: Date, default: new Date() },
    updateAt: { type: Date, default: "" },
  },
  { timestamps: true }
);

// Export the Cart model
module.exports = mongoose.model("Cart", CartSchema);
