import Redis from "ioredis";
import apiError from "../utils/apiError";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new apiError(
    500,
    "REDIS_URL not found"
  );
}

const redis = new Redis(redisUrl,{
    lazyConnect:true
});

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (error) => {
  console.error("Redis Error:", error);
});

export default redis;