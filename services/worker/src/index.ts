import { createClient } from "@redis/client";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.NEXT_REDIS_URL!;
const redisPassword = process.env.NEXT_REDIS_PASSWORD!;
const dbUrl = process.env.DATABASE_URL!;
const redisPort = parseInt(process.env.NEXT_REDIS_PORT!);

// Redis Client Setup
const redisClient = createClient({
  username: "default",
  password: redisPassword,
  socket: {
    host: redisUrl,
    port: redisPort,
  },
});

// PostgreSQL Client Setup
const pool = new Pool({ connectionString: dbUrl });

interface Message {
  from: number;
  content: string;
}

interface ServerMessage {
  Message: Message;
  roomId: string;
}

// Connect to Redis with Retry
async function connectRedis() {
  let attempts = 0;
  while (attempts < 5) {
    try {
      await redisClient.connect();
      console.log("Connected to Redis");
      return;
    } catch (error) {
      console.error(`Redis connection failed (Attempt ${attempts + 1}):`, error);
      attempts++;
      await new Promise((res) => setTimeout(res, 2000)); // Retry after 2s
    }
  }
  throw new Error("Redis connection failed after 5 attempts");
}

// Fetch messages in batch
async function fetchMessages() {
  const messages = await redisClient.lRange("message", 0, 9);
  if (messages.length === 0) return [];
  await redisClient.lTrim("message", messages.length, -1);
  return messages.map((msg) => JSON.parse(msg));
}

// Insert messages in batch with transaction
async function insertMessages(messages: ServerMessage[]) {
  const pgClient = await pool.connect();
  try {
    await pgClient.query("BEGIN");
    for (const data of messages) {
      await pgClient.query(
        `INSERT INTO "Message" (id, content, "userId", "ChatRoomId", "createdAt")
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), data.Message.content, data.Message.from, data.roomId, new Date()]
      );
    }
    await pgClient.query("COMMIT");
    console.log(`Inserted ${messages.length} messages`);
  } catch (error) {
    await pgClient.query("ROLLBACK");
    console.error("Transaction failed:", error);
  } finally {
    pgClient.release();
  }
}

// Worker process
async function worker() {
  await connectRedis();
  console.log("Worker started...");
  try {
    while (true) {
      const messages = await fetchMessages();
      if (messages.length > 0) {
        await insertMessages(messages);
      }
    }
  } catch (error) {
    console.error("Worker error:", error);
  } finally {
    await redisClient.disconnect();
    await pool.end();
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await redisClient.disconnect();
  await pool.end();
  process.exit(0);
});

// Start worker
worker().catch(console.error);
