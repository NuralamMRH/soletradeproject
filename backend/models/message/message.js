const MessageSchema = new Schema({
  conversation_id: { type: Schema.Types.ObjectId, ref: "Conversation" },
  sender_id: { type: Schema.Types.ObjectId, ref: "UserInfo" },
  is_seen: { type: Boolean, default: false },
});

// Relationships
MessageSchema.virtual("sender", {
  ref: "UserInfo",
  localField: "sender_id",
  foreignField: "_id",
  justOne: true,
});

MessageSchema.virtual("conversation", {
  ref: "Conversation",
  localField: "conversation_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Message", MessageSchema);
