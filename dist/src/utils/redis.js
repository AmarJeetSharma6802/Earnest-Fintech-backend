"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@upstash/redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Default values for local development if not provided in .env
const REDIS_URL = process.env.REDIS_URL || '';
const REDIS_TOKEN = process.env.REDIS_TOKEN || '';
const redis = new redis_1.Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
});
exports.default = redis;
