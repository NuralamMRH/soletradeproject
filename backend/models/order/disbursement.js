const mongoose = require("mongoose");
const { Schema } = mongoose;

const disbursementSchema = new Schema(
  {
    total_amount: { type: Number, default: 0.0 },
  },
  {
    timestamps: true,
  }
);

// Relations
disbursementSchema.virtual("details", {
  ref: "DisbursementDetails",
  localField: "_id",
  foreignField: "disbursement_id",
});

const Disbursement = mongoose.model("Disbursement", disbursementSchema);
module.exports = Disbursement;
