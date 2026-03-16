import { Router } from "express";
import { auth, logout, getMe } from "../controllers/auth.controller";
import { loginRateLimiter } from "../middlewares/rateLimiter";
import { authUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", loginRateLimiter, auth);
router.post("/logout", authUser, logout);
router.get("/me", authUser, getMe);

export default router;
