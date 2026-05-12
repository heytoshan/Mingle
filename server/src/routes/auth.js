import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { sendEmail } from "../utils/mail.js";
import { getOtpEmailHtml } from "../utils/mailTemplate.js";

const router = express.Router();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "DJKALDJFL";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, username, firstName, lastName, password, otp } = req.body;

    // Verify OTP (ensure robust string-to-number parsing)
    const existingOtp = await Otp.findOne({ email, otp: Number(otp) });
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

    // Log to console so you can always see it in the terminal
    console.log(`\n---------------------------------`);
    console.log(`🔥 Mingle OTP for ${email}: ${otpValue}`);
    console.log(`---------------------------------\n`);

    // Only attempt to send email if credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendEmail({
          email,
          subject: "Verify your Mingle Account",
          message: `Your Mingle verification code is ${otpValue}. It is valid for 5 minutes.`,
          html: getOtpEmailHtml(otpValue),
        });
      } catch (mailError) {
        console.error("Mail Error (Configuration issue):", mailError.message);
      }
    }

    // Always return success so the user can enter the OTP from the console
    res.json({ message: "OTP generated successfully! Please check your email inbox (and spam folder) or check the backend terminal logs." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
