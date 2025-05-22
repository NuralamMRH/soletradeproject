const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrderReqSchema = new Schema(
  {
    order_type: {
      type: String,
      enum: ["Warehouse", "Address"],
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
    order_amount: { type: Number, required: true },
    coupon_discount_amount: { type: Number },
    total_tax_amount: { type: Number },
    seller_discount_amount: { type: Number },
    delivery_charge: { type: Number },
    shipping_address: { type: Schema.Types.ObjectId, ref: "Address" },
    scheduled: { type: Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyer_id: { type: Schema.Types.ObjectId, ref: "User" },
    seller_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order_req_status: {
      type: String,
      enum: ["pending", "accepted", "canceled", "failed"],
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
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    qrCode: { type: String },
    order_invoice: { type: String },
    deliveredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
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
OrderReqSchema.statics.pending = function () {
  return this.find({ order_status: "pending" })
}

OrderReqSchema.statics.delivered = function () {
  return this.find({ order_status: "delivered" })
}

OrderReqSchema.virtual("buyer", {
  ref: "Seller",
  localField: "buyer_id",
  foreignField: "user_id",
  justOne: true,
})
OrderReqSchema.virtual("seller", {
  ref: "Seller",
  localField: "seller_id",
  foreignField: "user_id",
  justOne: true,
})
OrderReqSchema.virtual("logs", {
  ref: "Log",
  localField: "_id",
  foreignField: "order_id",
  justOne: false,
})

OrderReqSchema.virtual("payments", {
  ref: "OrderPayment",
  localField: "_id",
  foreignField: "order_id",
  justOne: false,
})

OrderReqSchema.virtual("delivery_man", {
  ref: "DeliveryMan",
  localField: "delivery_man_id",
  foreignField: "_id",
  justOne: true,
})

let qrIncrement = 1 // Global increment variable
OrderReqSchema.pre("save", async function (next) {
  const order = this

  if (!order.qrCode) {
    const date = new Date()
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = String(date.getFullYear()).slice(-2)

    order.qrCode = `${order.order_type.slice(0, 2).toUpperCase()}/${
      order.orderItems.length
    }/${order.payment_status
      .slice(0, 2)
      .toUpperCase()}/${day}/${month}/${year}/${String(qrIncrement).padStart(
      3,
      "0"
    )}`

    qrIncrement++ // Increment the QR counter
  }

  next()
})

module.exports = mongoose.model("OrderRequest", OrderReqSchema)
