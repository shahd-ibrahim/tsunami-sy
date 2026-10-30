import Redis, { RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redisConnectionConfig: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    // Retry up to 5 times with backoff, then log warning
    if (times > 5) return null;
    return Math.min(times * 300, 2000);
  },
  lazyConnect: true,
};

let redisClient: Redis | null = null;
let isRedisAvailable = false;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisUrl, redisConnectionConfig);

    redisClient.on("connect", () => {
      isRedisAvailable = true;
      console.log("[Redis] Connected successfully to Redis/DragonflyDB");
    });

    redisClient.on("error", (err) => {
      isRedisAvailable = false;
      // Keep quiet about connection refused in local dev without Redis
      if (err.message.includes("ECONNREFUSED")) {
        // Expected if local Redis is not started
      } else {
        console.warn("[Redis] Connection error:", err.message);
      }
    });
  }
  return redisClient;
}

export function checkRedisAvailable(): boolean {
  return isRedisAvailable;
}
