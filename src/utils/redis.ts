import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

// Default values for local development if not provided in .env
const REDIS_URL = process.env.REDIS_URL || '';
const REDIS_TOKEN = process.env.REDIS_TOKEN || '';

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export default redis;
