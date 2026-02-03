"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@redis/client");
const pg_1 = require("pg");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.NEXT_REDIS_URL;
const redisPassword = process.env.NEXT_REDIS_PASSWORD;
const dbUrl = process.env.DATABASE_URL;
const redisPort = parseInt(process.env.NEXT_REDIS_PORT);
// Redis Client Setup
const redisClient = (0, client_1.createClient)({
    username: "default",
    password: redisPassword,
    socket: {
        host: redisUrl,
        port: redisPort,
    },
});
// PostgreSQL Client Setup
const pool = new pg_1.Pool({ connectionString: dbUrl });
// Connect to Redis with Retry
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        let attempts = 0;
        while (attempts < 5) {
            try {
                yield redisClient.connect();
                console.log("Connected to Redis");
                return;
            }
            catch (error) {
                console.error(`Redis connection failed (Attempt ${attempts + 1}):`, error);
                attempts++;
                yield new Promise((res) => setTimeout(res, 2000)); // Retry after 2s
            }
        }
        throw new Error("Redis connection failed after 5 attempts");
    });
}
// Fetch messages in batch
function fetchMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield redisClient.lRange("message", 0, 9);
        if (messages.length === 0)
            return [];
        yield redisClient.lTrim("message", messages.length, -1);
        return messages.map((msg) => JSON.parse(msg));
    });
}
// Insert messages in batch with transaction
function insertMessages(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgClient = yield pool.connect();
        try {
            yield pgClient.query("BEGIN");
            for (const data of messages) {
                yield pgClient.query(`INSERT INTO "Message" (id, content, "userId", "ChatRoomId", "createdAt")
         VALUES ($1, $2, $3, $4, $5)`, [(0, uuid_1.v4)(), data.Message.content, data.Message.from, data.roomId, new Date()]);
            }
            yield pgClient.query("COMMIT");
            console.log(`Inserted ${messages.length} messages`);
        }
        catch (error) {
            yield pgClient.query("ROLLBACK");
            console.error("Transaction failed:", error);
        }
        finally {
            pgClient.release();
        }
    });
}
// Worker process
function worker() {
    return __awaiter(this, void 0, void 0, function* () {
        yield connectRedis();
        console.log("Worker started...");
        try {
            while (true) {
                const messages = yield fetchMessages();
                if (messages.length > 0) {
                    yield insertMessages(messages);
                }
            }
        }
        catch (error) {
            console.error("Worker error:", error);
        }
        finally {
            yield redisClient.disconnect();
            yield pool.end();
        }
    });
}
// Graceful shutdown
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down worker...");
    yield redisClient.disconnect();
    yield pool.end();
    process.exit(0);
}));
// Start worker
worker().catch(console.error);
