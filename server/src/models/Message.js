import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ["TEXT", "FILE"], default: "TEXT" },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ChatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true }
});

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
