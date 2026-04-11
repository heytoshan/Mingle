import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema({
  name: { type: String },
  isGroup: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
});

export const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);
