"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken ||
            req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESSTOKEN);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.user_id }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.user = user; // attach user to request
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authUser = authUser;
