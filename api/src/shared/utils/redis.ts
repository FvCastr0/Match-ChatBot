import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Instância compartilhada do Redis para operações diretas
export const redisClient = new Redis(redisUrl);

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});
