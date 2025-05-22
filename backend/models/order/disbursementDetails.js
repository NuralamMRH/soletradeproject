const mongoose = require("mongoose");
const { Schema } = mongoose;

const disbursementDetailsSchema = new Schema({
  disbursement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Disbursement",
    required: true,
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  delivery_man_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryMan",
    required: true,
  },
  payment_method: { type: Number, required: true },
  disbursement_amount: { type: Number, default: 0.0 },
  is_default: { type: Boolean, default: false },
});

const DisbursementDetails = mongoose.model(
  "DisbursementDetails",
  disbursementDetailsSchema
);
module.exports = DisbursementDetails;
