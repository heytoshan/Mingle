import express from "express";
import { ChatRoom } from "../models/ChatRoom.js";
import { Message } from "../models/Message.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get All Chats for Current User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      users: req.userId
    }).populate('users', 'email username avatar firstName lastName');

    const groupedChats = chatRooms.reduce(
      (acc, chatRoom) => {
        const chatRoomData = {
          id: chatRoom._id.toString(),
          name: chatRoom.name,
          isGroup: chatRoom.isGroup,
          createdAt: chatRoom.createdAt,
          users: chatRoom.users.map(u => {
            if (!u) return null;
            return {
              ...(u.toObject ? u.toObject() : u),
              id: (u._id || u.id)?.toString()
            };
          }).filter(Boolean),
        };

        if (chatRoom.isGroup) {
          acc.groupsData.push(chatRoomData);
        } else {
          acc.singleChatData.push(chatRoomData);
        }

        return acc;
      },
      { groupsData: [], singleChatData: [] }
    );
    res.json(groupedChats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Chat Room
router.put("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { name, users } = req.body;
    const chatRoom = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { name, users },
      { new: true }
    ).populate('users', 'username avatar');
    res.json(chatRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Direct Private Chat Room (DM)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    // Check if DM room already exists
    const existingChat = await ChatRoom.findOne({
      isGroup: false,
      users: { $all: [req.userId, targetUserId] }
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const chatRoom = await ChatRoom.create({
      isGroup: false,
      users: [req.userId, targetUserId]
    });

    res.status(201).json(chatRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Group Chat
router.post("/group", authMiddleware, async (req, res) => {
  try {
    const { name, userIds } = req.body;
    if (!userIds.includes(req.userId)) {
      userIds.push(req.userId);
    }
    const chatRoom = await ChatRoom.create({
      name,
      isGroup: true,
      users: userIds
    });
    res.status(201).json(chatRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Messages for Room
router.get("/:roomId/messages", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ ChatRoomId: roomId })
      .select('_id content userId ChatRoomId')
      .sort({ createdAt: 'asc' })
      .lean();

    const formattedMessages = messages.map(msg => {
      if (!msg || !msg.userId) return null;
      return {
        id: msg._id.toString(),
        from: msg.userId.toString(),
        content: msg.content
      };
    }).filter(Boolean);
    res.json(formattedMessages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
