"use server";
import { createClient } from "redis";
import { Message } from "../types";

const redisUrl = process.env.NEXT_REDIS_URL;
const redisPassword = process.env.NEXT_REDIS_PASSWORD;
const redisPort = parseInt(process.env.NEXT_REDIS_PORT!);
const client = createClient({
  password: redisPassword,
  socket: {
    host: redisUrl,
    port: redisPort
  }
});
client.on("error", (err) => console.error("redis client error ", err));

(async () => {
  await client.connect()
})();

export const uploadOnRedis = async (Message: Message, roomId: string) => {
  try {
    await client.lPush(
      "message",
      JSON.stringify({ Message, roomId }),
    );
    console.log("uploaded on redis");
  } catch (error) {
    console.error("couldn't uploaded on redis: " + error);
  }
}
