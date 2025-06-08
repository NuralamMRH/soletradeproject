const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentMethodsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String },
    paymentType: { type: String, required: true },
    section: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    cardNumber: { type: String },
    expiryDate: { type: String },
    cvv: { type: String },
    bank: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

PaymentMethodsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

PaymentMethodsSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  const PaymentMethod = mongoose.model("PaymentMethod");

  // If isDefault is true (or not set), make this the only default for the user and paymentType
  if (this.isDefault === true || this.isDefault === undefined) {
    // Set all other payment methods for this user and paymentType to isDefault: false
    await PaymentMethod.updateMany(
      {
        userId: this.userId,
        paymentType: this.paymentType,
        _id: { $ne: this._id },
      },
      { isDefault: false }
    );
    this.isDefault = true;
  } else if (this.isNew && !this.isDefault) {
    // If this is the first payment method for the user and paymentType, set as default
    const count = await PaymentMethod.countDocuments({
      userId: this.userId,
      paymentType: this.paymentType,
    });
    if (count === 0) {
      this.isDefault = true;
    }
  }

  next();
});

module.exports = mongoose.model("PaymentMethod", PaymentMethodsSchema);
