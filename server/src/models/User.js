import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  password: { type: String, required: true },
  avatar: { 
    type: String, 
    default: "https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png" 
  },
  chatRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" }]
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
