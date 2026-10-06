import { Request, Response, NextFunction } from "express";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

// Clean up expired buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || (req.headers["x-forwarded-for"] as string) || "127.0.0.1";
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
      return next();
    }

    bucket.count++;
    if (bucket.count > options.max) {
      const waitSec = Math.ceil((bucket.resetAt - now) / 1000);
      return res.status(429).json({
        success: false,
        data: null,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: `${options.message} Please try again in ${waitSec} seconds.`,
          retryAfter: waitSec,
        },
      });
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 15,
  message: "Too many login attempts.",
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many accounts created from this network.",
});

export const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6,
  message: "Too many password reset requests.",
});
