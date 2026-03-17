import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import redis from '../utils/redis';
export const auth = async (req: Request, res: Response) => {
  try {
    const { name, email, password, action } = req.body;

    if (action === "register") {
      if (!name || !email || !password) {
        console.warn("Register failed: missing fields");
        return res.status(400).json({ message: "All fields required" });
      }

      const exists = await prisma.user.findUnique({ where: { email } });

      if (exists) {
        console.warn(`Register failed: ${email} already exists`);
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
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

      const attempts = await redis.incr(`login_attempt:${email}`);

      if (attempts === 1) await redis.expire(`login_attempt:${email}`, 600);

      if (attempts > 10)
        return res.status(429).json({ message: "Too many login attempts" });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // console.warn(`Invalid login attempt: ${email}`);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      await redis.del(`login_attempt:${email}`);


      const accessToken = jwt.sign({ user_id: user.id }, process.env.ACCESSTOKEN!, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign(
        { user_id: user.id },
        process.env.REFRESHTOKEN!,
        { expiresIn: "7d" },
      );

      await redis.set(`session:${user.id}`, refreshToken, { ex: 604800 });

      res.cookie("accessToken", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });

      console.log(`Login success: ${email}`);

      return res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken });
    }

    return res
      .status(400)
      .json({ message: "Invalid action", receivedAction: action });
  } catch (error) {
    console.error(`Auth error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user) {
      await redis.del(`session:${user.id}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`Logout error: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(`GetMe error: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
