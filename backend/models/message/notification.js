const NotificationSchema = new Schema({
  status: { type: Number, default: 1 },
  title: { type: String },
  description: { type: String },
  image: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
NotificationSchema.virtual("city", {
  ref: "City",
  localField: "_id",
  foreignField: "_id",
  justOne: true,
});
NotificationSchema.virtual("market", {
  ref: "Market",
  localField: "_id",
  foreignField: "_id",
  justOne: true,
});

// Add a global scope
NotificationSchema.pre(/^find/, function (next) {
  this.where({ status: 1 }); // Only active notifications
  next();
});

module.exports = mongoose.model("Notification", NotificationSchema);
