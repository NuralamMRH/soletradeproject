const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // Action name (e.g., "Order Placed")
    model_id: { type: Schema.Types.ObjectId, required: true }, // ID of related resource
    model: { type: String, required: true }, // Resource type (e.g., "Order", "Message")
    action: { type: String, required: true }, // Action type (e.g., "created", "updated") ['order_placed', 'friend_interactive', 'chat_message', 'mail', 'order_shipped']
    data: { type: Schema.Types.Mixed }, // Additional data for the log
    image: { type: String, required: false }, // Image
    video: { type: String, required: false }, // Video
    icon: { type: String, required: false }, // Icon
    message: { type: String, required: false }, // Message
    seen: { type: Boolean, default: false }, // Seen status
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

LogSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Log", LogSchema);
