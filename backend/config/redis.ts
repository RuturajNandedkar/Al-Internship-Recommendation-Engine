import Redis from "ioredis";
import logger from "../utils/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;
let redisAvailable = false;

try {
  redisClient = new Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1, // Reduced for faster failure detection
    connectTimeout: 3000,
    retryStrategy: () => null, // Don't retry indefinitely
  });

  redisClient.on("connect", () => {
    redisAvailable = true;
    logger.info("Redis connected successfully");
  });

  redisClient.on("error", (err) => {
    redisAvailable = false;
    logger.error("Redis connection error", { error: err.message });
  });
} catch (error: any) {
  redisClient = null;
  redisAvailable = false;
  logger.error("Failed to initialize Redis client", { error: error.message });
}

export { redisClient, redisAvailable };
export default redisClient;
