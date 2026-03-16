"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protect all task routes
router.use(auth_middleware_1.authUser);
router.post("/", task_controller_1.createTask);
router.get("/", task_controller_1.getTasks);
router.get("/:id", task_controller_1.getTaskById);
router.patch("/:id", task_controller_1.updateTask);
router.delete("/:id", task_controller_1.deleteTask);
router.patch("/:id/toggle", task_controller_1.toggleTaskStatus);
exports.default = router;
