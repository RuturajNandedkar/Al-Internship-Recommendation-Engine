import logger from "../utils/logger";

const REDIS_URL = process.env.REDIS_URL;
export const REDIS_ENABLED = !!REDIS_URL;

let redisClient: any = null;
let redisAvailable = false;

if (REDIS_ENABLED) {
  try {
    const Redis = require("ioredis");
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy: (): any => null,
    });

    redisClient.on("connect", (): void => {
      redisAvailable = true;
      logger.info("Redis connected successfully");
    });

    redisClient.on("error", (err: any): void => {
      redisAvailable = false;
      logger.error("Redis connection error", { error: err.message });
    });
  } catch (error: any) {
    redisClient = null;
    redisAvailable = false;
    logger.error("Failed to initialize Redis client", { error: error.message });
  }
}

export { redisClient, redisAvailable };
export default redisClient;
