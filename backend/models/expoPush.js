const mongoose = require("mongoose");

const expoPushSchema = mongoose.Schema({
  expoPushToken: {
    type: String,
    default: "",
  },
});

expoPushSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

expoPushSchema.set("toJSON", {
  virtuals: true,
});

exports.ExpoPush = mongoose.model("ExpoPush", expoPushSchema);
