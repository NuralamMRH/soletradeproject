const mongoose = require("mongoose");

const calenderNotifySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

calenderNotifySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

calenderNotifySchema.set("toJSON", {
  virtuals: true,
});

exports.CalenderNotify = mongoose.model("CalenderNotify", calenderNotifySchema);
