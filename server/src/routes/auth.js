import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";

const router = express.Router();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "DJKALDJFL";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, username, firstName, lastName, password, otp } = req.body;

    // Verify OTP
    const existingOtp = await Otp.findOne({ email, otp });
    if (!existingOtp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      firstName,
      lastName,
      password: hashedPassword
    });

    await Otp.deleteOne({ _id: existingOtp._id });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// OTP Generate
router.post("/otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otpValue = Math.floor(1000 + Math.random() * 9000);
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpValue, createdAt: new Date() },
      { upsert: true }
    );
    // Mock sending email
    console.log(`Email to ${email}: Your OTP is ${otpValue}`);
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
