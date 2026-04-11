import express from "express";
import { User } from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get Current User
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -__v").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user, id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update User
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { username, email, firstName, lastName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email, firstName, lastName, avatar },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search Users
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $and: [
        { 
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.userId } }
      ]
    }).select("username firstName lastName avatar");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
