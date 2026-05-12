import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ChatRoom } from "../models/ChatRoom.js";
import { Message } from "../models/Message.js";
import { Otp } from "../models/Otp.js";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not defined in the environment variables.");
  process.exit(1);
}

async function recreateDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(DATABASE_URL);
    console.log("🚀 Connected to MongoDB successfully!");

    const db = mongoose.connection.db;

    // 1. Fetch all existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    console.log(`📦 Found existing collections: ${collectionNames.join(", ") || "None"}`);

    // Define Mingle specific collections
    const mingleCollections = ["users", "chatrooms", "messages", "otps"];

    // 2. Identify and drop any blog or unrelated collections
    console.log("🧹 Scanning for unrelated or legacy collections to clean up...");
    for (const name of collectionNames) {
      if (!mingleCollections.includes(name.toLowerCase())) {
        console.log(`⚠️  Dropping unrelated/legacy collection: '${name}'`);
        await db.dropCollection(name);
      }
    }

    // 3. Drop all Mingle collections to start fresh
    console.log("🗑️  Clearing existing Mingle database collections...");
    for (const name of mingleCollections) {
      const match = collectionNames.find(c => c.toLowerCase() === name);
      if (match) {
        console.log(`   - Dropping collection: '${match}'`);
        await db.dropCollection(match);
      }
    }

    console.log("✨ All tables/collections cleared! Starting recreation...");

    // 4. Create Users
    console.log("👥 Creating seed users...");
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("password123", salt);

    const usersData = [
      {
        username: "alice",
        email: "alice@mingle.com",
        firstName: "Alice",
        lastName: "Vance",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      },
      {
        username: "bob",
        email: "bob@mingle.com",
        firstName: "Bob",
        lastName: "Miller",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      },
      {
        username: "charlie",
        email: "charlie@mingle.com",
        firstName: "Charlie",
        lastName: "Davis",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150",
      },
      {
        username: "emma",
        email: "emma@mingle.com",
        firstName: "Emma",
        lastName: "Watson",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      }
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`✅ Created ${createdUsers.length} seed users:`);
    createdUsers.forEach(u => {
      console.log(`   - ${u.firstName} (${u.username} - ${u.email})`);
    });

    const [alice, bob, charlie, emma] = createdUsers;

    // 5. Create Chat Rooms
    console.log("💬 Creating chat rooms...");
    
    // Group Chats
    const generalGroup = await ChatRoom.create({
      name: "General Mingle Chat",
      isGroup: true,
      users: [alice._id, bob._id, charlie._id, emma._id]
    });

    const techGroup = await ChatRoom.create({
      name: "Mingle Tech Talk",
      isGroup: true,
      users: [alice._id, bob._id, charlie._id]
    });

    // Single / Direct Chat Rooms
    const aliceBobDm = await ChatRoom.create({
      isGroup: false,
      users: [alice._id, bob._id]
    });

    const bobCharlieDm = await ChatRoom.create({
      isGroup: false,
      users: [bob._id, charlie._id]
    });

    const aliceEmmaDm = await ChatRoom.create({
      isGroup: false,
      users: [alice._id, emma._id]
    });

    console.log("✅ Created group and direct chat rooms.");

    // Update users with their chat rooms
    await User.findByIdAndUpdate(alice._id, { $push: { chatRooms: { $each: [generalGroup._id, techGroup._id, aliceBobDm._id, aliceEmmaDm._id] } } });
    await User.findByIdAndUpdate(bob._id, { $push: { chatRooms: { $each: [generalGroup._id, techGroup._id, aliceBobDm._id, bobCharlieDm._id] } } });
    await User.findByIdAndUpdate(charlie._id, { $push: { chatRooms: { $each: [generalGroup._id, techGroup._id, bobCharlieDm._id] } } });
    await User.findByIdAndUpdate(emma._id, { $push: { chatRooms: { $each: [generalGroup._id, aliceEmmaDm._id] } } });

    // 6. Create Message History
    console.log("✍️  Populating seed messages...");
    
    const messagesData = [
      // General Group Messages
      { content: "Hey everyone! Welcome to Mingle! 🎉", userId: alice._id, ChatRoomId: generalGroup._id },
      { content: "Hi Alice! This chat app looks absolutely gorgeous. 🤩", userId: bob._id, ChatRoomId: generalGroup._id },
      { content: "Wow, the real-time updates are so fast!", userId: charlie._id, ChatRoomId: generalGroup._id },
      { content: "Glad to be here! Let's mingle!", userId: emma._id, ChatRoomId: generalGroup._id },

      // Tech Group Messages
      { content: "Are we building the backend with Node and MongoDB?", userId: bob._id, ChatRoomId: techGroup._id },
      { content: "Yes! Mongoose handles our schema, and WS handles WebSockets.", userId: alice._id, ChatRoomId: techGroup._id },
      { content: "Awesome, it keeps the tech stack completely clean and light.", userId: charlie._id, ChatRoomId: techGroup._id },

      // Alice-Bob DM Messages
      { content: "Hey Bob, did you check the new UI animations?", userId: alice._id, ChatRoomId: aliceBobDm._id },
      { content: "Yeah Alice, they are extremely smooth! Glassmorphism fits perfectly.", userId: bob._id, ChatRoomId: aliceBobDm._id },

      // Bob-Charlie DM Messages
      { content: "Hey Charlie, are we meeting up for code review today?", userId: bob._id, ChatRoomId: bobCharlieDm._id },
      { content: "Yep, let's connect in an hour in the main voice channel.", userId: charlie._id, ChatRoomId: bobCharlieDm._id },

      // Alice-Emma DM Messages
      { content: "Hi Emma! How are you doing?", userId: alice._id, ChatRoomId: aliceEmmaDm._id },
      { content: "Great Alice! Doing some final testing on the profile settings.", userId: emma._id, ChatRoomId: aliceEmmaDm._id }
    ];

    const createdMessages = [];
    for (const msg of messagesData) {
      const newMsg = await Message.create(msg);
      createdMessages.push(newMsg);
      // Link message to its chatroom
      await ChatRoom.findByIdAndUpdate(msg.ChatRoomId, { $push: { messages: newMsg._id } });
    }

    console.log(`✅ Seeded ${createdMessages.length} messages across chat rooms.`);

    console.log("\n==========================================");
    console.log("🎉 DATABASE RECREATED & SEEDED SUCCESSFUL!");
    console.log("==========================================");
    console.log("Credentials for seed accounts (Password: password123):");
    console.log("1. alice@mingle.com");
    console.log("2. bob@mingle.com");
    console.log("3. charlie@mingle.com");
    console.log("4. emma@mingle.com");
    console.log("==========================================\n");

  } catch (err) {
    console.error("❌ Database recreation failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

recreateDatabase();
