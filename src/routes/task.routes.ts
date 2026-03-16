import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask, toggleTaskStatus } from "../controllers/task.controller";
import { authUser } from "../middlewares/auth.middleware";

const router = Router();

// Protect all task routes
router.use(authUser);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/toggle", toggleTaskStatus);

export default router;
