import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  otp: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Expiry in 5 mins
});

export const Otp = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
