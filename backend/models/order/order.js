const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrderSchema = new Schema(
  {
    order_type: {
      type: String,
      enum: ["Auction", "E-Commerce", "Warehouse", "Transfer"],
    },
    orderItems: [
      {
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    coupon_discount_amount: { type: Number },
    discount: { type: Number },
    delivery_charge: { type: Number },
    itemsAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    exportFrom: { type: Schema.Types.ObjectId, ref: "Address" },
    importTo: { type: Schema.Types.ObjectId, ref: "Address" },
    scheduled: { type: Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User" },
    seller_id: { type: Schema.Types.ObjectId, ref: "User" },
    orderRequest: { type: Schema.Types.ObjectId, ref: "OrderRequest" },
    order_status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "canceled",
        "failed",
        "in transit",
        "completed",
        "confirm",
        "processing",
        "delivered",
        "draft",
      ],
      default: "pending",
    },
    payment_method: { type: String },
    payment_status: {
      type: String,
      enum: ["paid", "unpaid", "canceled", "overdue", "pending"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: "",
    },

    importerQrCode: { type: String },
    exporterQrCode: { type: String, default: "" },
    importerPDFPath: { type: String, default: "" },
    exportPDFPath: { type: String, default: "" },
    //Truck details
    exportAt: {
      type: Date,
    },
    arrivalAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
      default: "",
    },

    truckId: { type: String, default: "" },
    trackingCompany: { type: String, default: "" },
    truckCompanyPhone: { type: String, default: "" },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Scopes
OrderSchema.statics.pending = function () {
  return this.find({ order_status: "pending" })
}

OrderSchema.statics.delivered = function () {
  return this.find({ order_status: "delivered" })
}

OrderSchema.virtual("logs", {
  ref: "Log",
  localField: "_id",
  foreignField: "order_id",
  justOne: false,
})

OrderSchema.virtual("payments", {
  ref: "OrderPayment",
  localField: "_id",
  foreignField: "order_id",
  justOne: false,
})

OrderSchema.virtual("delivery_man", {
  ref: "DeliveryMan",
  localField: "delivery_man_id",
  foreignField: "_id",
  justOne: true,
})

module.exports = mongoose.model("Order", OrderSchema)
