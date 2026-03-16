"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.auth = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const redis_1 = __importDefault(require("../utils/redis"));
const auth = async (req, res) => {
    try {
        const { name, email, password, action } = req.body;
        if (action === "register") {
            if (!name || !email || !password) {
                console.warn("Register failed: missing fields");
                return res.status(400).json({ message: "All fields required" });
            }
            const exists = await prisma_1.default.user.findUnique({ where: { email } });
            if (exists) {
                console.warn(`Register failed: ${email} already exists`);
                return res.status(400).json({ message: "Email already registered" });
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const newUser = await prisma_1.default.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
            console.log(`User registered: ${email}`);
            return res.status(201).json({
                message: "Registered successfully",
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            });
        }
        if (action === "login") {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password required" });
            }
            const attempts = await redis_1.default.incr(`login_attempt:${email}`);
            if (attempts === 1)
                await redis_1.default.expire(`login_attempt:${email}`, 600);
            if (attempts > 5)
                return res.status(429).json({ message: "Too many login attempts" });
            const user = await prisma_1.default.user.findUnique({ where: { email } });
            if (!user)
                return res.status(404).json({ message: "User not found" });
            const isMatch = await bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                console.warn(`Invalid login attempt: ${email}`);
                return res.status(400).json({ message: "Invalid credentials" });
            }
            await redis_1.default.del(`login_attempt:${email}`);
            const accessToken = jsonwebtoken_1.default.sign({ user_id: user.id }, process.env.ACCESSTOKEN, {
                expiresIn: "15m",
            });
            const refreshToken = jsonwebtoken_1.default.sign({ user_id: user.id }, process.env.REFRESHTOKEN, { expiresIn: "7d" });
            await redis_1.default.set(`session:${user.id}`, refreshToken, { ex: 604800 });
            res.cookie("accessToken", accessToken, { httpOnly: true });
            res.cookie("refreshToken", refreshToken, { httpOnly: true });
            console.log(`Login success: ${email}`);
            return res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken });
        }
        return res
            .status(400)
            .json({ message: "Invalid action", receivedAction: action });
    }
    catch (error) {
        console.error(`Auth error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.auth = auth;
const logout = async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            await redis_1.default.del(`session:${user.id}`);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error(`Logout error: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } });
    }
    catch (error) {
        console.error(`GetMe error: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMe = getMe;
