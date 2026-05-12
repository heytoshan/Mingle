import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import { Message } from "./models/Message.js";
import { ChatRoom } from "./models/ChatRoom.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "DJKALDJFL";

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("🚀 MongoDB Connected"))
  .catch(err => console.error("MongoDB error", err));

// WebSocket Logic
const rooms = {};
const userConnections = new Map();
const onlineUsers = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case "connect":
          const userId = data.userId;
          ws.userId = userId;
          userConnections.set(userId, ws);
          onlineUsers.add(userId);
          broadcastUsers();
          ws.send(JSON.stringify({ type: "connection", message: "Connected to server" }));
          break;

        case "join":
          const roomId = data.roomId;
          if (!rooms[roomId]) rooms[roomId] = new Set();
          rooms[roomId].add(ws);
          ws.roomId = roomId;
          ws.send(JSON.stringify({ type: "join", message: `Joined ${roomId}` }));
          break;

        case "message":
          handleBroadcast(data.message, data.roomId, data.from, ws);
          break;

        case "edit-message": {
          const { messageId, content, roomId } = data;
          handleEditMessage(messageId, content, roomId);
          break;
        }

        case "create-room": {
          const { roomId, userIds } = data;
          userIds.forEach(uId => {
            const targetWs = userConnections.get(uId);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: "new-room",
                roomId
              }));
            }
          });
          break;
        }

        // WebRTC Signaling Handlers
        case "call-user": {
          const { to, offer } = data;
          const targetWs = userConnections.get(to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: "incoming-call",
              from: ws.userId,
              offer
            }));
          }
          break;
        }

        case "accept-call": {
          const { to, answer } = data;
          const targetWs = userConnections.get(to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: "call-accepted",
              from: ws.userId,
              answer
            }));
          }
          break;
        }

        case "ice-candidate": {
          const { to, candidate } = data;
          const targetWs = userConnections.get(to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: "ice-candidate",
              from: ws.userId,
              candidate
            }));
          }
          break;
        }

        case "hang-up": {
          const { to } = data;
          const targetWs = userConnections.get(to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: "call-hung-up",
              from: ws.userId
            }));
          }
          break;
        }
      }
    } catch (e) {
      console.error("WS error", e);
    }
  });

  ws.on("close", () => {
    if (ws.userId) {
      onlineUsers.delete(ws.userId);
      userConnections.delete(ws.userId);
      broadcastUsers();
    }
    if (ws.roomId && rooms[ws.roomId]) {
      rooms[ws.roomId].delete(ws);
    }
  });
});

function broadcastUsers() {
  const usersArray = Array.from(onlineUsers);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "connectedUsers", message: usersArray }));
    }
  });
}

async function handleEditMessage(messageId, content, roomId) {
  try {
    await Message.findByIdAndUpdate(messageId, { content });
    
    // Broadcast message update to all room members
    if (rooms[roomId]) {
      rooms[roomId].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "edit-message",
            message: { id: messageId, roomId, content }
          }));
        }
      });
    }
  } catch (err) {
    console.error("Failed to edit message:", err);
  }
}

async function handleBroadcast(content, roomId, from, senderWs) {
  try {
    // Save to Database directly (Bypassing Redis/Worker)
    const newMessage = await Message.create({
      content,
      userId: from,
      ChatRoomId: roomId
    });

    await ChatRoom.findByIdAndUpdate(roomId, {
      $push: { messages: newMessage._id }
    });

    // Broadcast to all clients in the room (including sender to distribute actual DB id)
    if (rooms[roomId]) {
      rooms[roomId].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "message",
            message: { id: newMessage._id.toString(), from, roomId, content }
          }));
        }
      });
    }
  } catch (error) {
    console.error("Failed to save/broadcast message:", error);
  }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
