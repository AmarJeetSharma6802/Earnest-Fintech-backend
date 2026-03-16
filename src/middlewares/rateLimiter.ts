import { Request, Response, NextFunction } from 'express';
import redis from '../utils/redis';


export const loginRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `rate-limit:login:${ip}`;

  try {
    const currentAttempts = await redis.incr(key);

    if (currentAttempts === 1) {
      await redis.expire(key, 900);
    }

    if (currentAttempts > 5) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      res.status(429).json({ message: 'Too many login attempts, please try again later.' });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limiter error', error);
    next();
  }
};
