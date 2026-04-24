import { Router } from "express";
import { auth, logout, getMe } from "../controllers/auth.controller";
import { loginRateLimiter } from "../middlewares/rateLimiter";
import { authUser } from "../middlewares/auth.middleware";
import {book} from "../controllers/book.controller"

const router = Router();

router.post("/", loginRateLimiter, auth);
router.post("/logout", authUser, logout);
router.get("/me", authUser, getMe);

// book 

router.route("/book").post(book)

export default router;
