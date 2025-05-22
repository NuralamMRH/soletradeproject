const mongoose = require("mongoose");

const userSettingSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isNotificationEnabled: {
    type: Boolean,
    default: true,
  },
  
});

userSettingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSettingSchema.set("toJSON", {
  virtuals: true,
});

exports.BlogPost = mongoose.model("BlogPost", userSettingSchema);
