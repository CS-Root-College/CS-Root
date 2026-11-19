import type { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import redis from "../config/redis";
import apiError from "../utils/apiError";

const createRateLimiter = (points: number, keyPrefix: string) => {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix,
    points,
    duration: 60,
    blockDuration: 60,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    const authenticatedReq = req as Request & {
      user?: { _id?: string };
    };

    const key = authenticatedReq.user?._id
      ? `user:${authenticatedReq.user._id}`
      : `ip:${req.ip}`;

    try {
      await limiter.consume(key);
      next();
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        res.setHeader(
          "Retry-After",
          Math.ceil(error.msBeforeNext / 1000),
        );

        return next(
          new apiError(
            429,
            "Too many requests. Please try again later.",
          ),
        );
      }

      return next(
        new apiError(
          503,
          "Rate limiting service unavailable.",
        ),
      );
    }
  };
};

export const registerLimiter = createRateLimiter(5, "register");
export const verifyEmailLimiter = createRateLimiter(5, "verify-email");
export const loginLimiter = createRateLimiter(5, "login");
export const twoStepLimiter = createRateLimiter(5, "two-step");
export const meLimiter = createRateLimiter(30, "me");
export const profilePictureLimiter = createRateLimiter(
  10,
  "profile-picture",
);