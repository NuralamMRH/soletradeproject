const mongoose = require("mongoose");

const drawAttendSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoleDraw",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

drawAttendSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

drawAttendSchema.set("toJSON", {
  virtuals: true,
});

exports.DrawAttend = mongoose.model("DrawAttend", drawAttendSchema);
