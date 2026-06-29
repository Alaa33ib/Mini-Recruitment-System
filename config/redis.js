import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err)=> console.error("Redis client connection error", err));
redisClient.on('connect', ()=> console.log("Redis client connected successfully: 127.0.0.1"));

export const connectRedis = async () => {
    await redisClient.connect();
};

export { redisClient };