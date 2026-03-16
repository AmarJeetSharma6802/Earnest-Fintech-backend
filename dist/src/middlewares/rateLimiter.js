"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimiter = void 0;
const redis_1 = __importDefault(require("../utils/redis"));
const loginRateLimiter = async (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate-limit:login:${ip}`;
    try {
        const currentAttempts = await redis_1.default.incr(key);
        if (currentAttempts === 1) {
            await redis_1.default.expire(key, 900);
        }
        if (currentAttempts > 5) {
            console.warn(`Rate limit exceeded for IP: ${ip}`);
            res.status(429).json({ message: 'Too many login attempts, please try again later.' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Rate limiter error', error);
        next();
    }
};
exports.loginRateLimiter = loginRateLimiter;
