import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, toggleTaskStatus } from "../controllers/task.controller";
import { authUser } from "../middlewares/auth.middleware";

const router = Router();


router.post("/", authUser, createTask);
router.get("/", authUser,getTasks);
router.get("/:id",authUser, getTaskById);
router.patch("/:id",authUser, updateTask);
router.delete("/:id", authUser, deleteTask);
router.patch("/:id/toggle", authUser, toggleTaskStatus);

export default router;
