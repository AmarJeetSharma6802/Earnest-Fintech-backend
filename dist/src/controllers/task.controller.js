"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTaskStatus = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const createTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const newTask = await prisma_1.default.task.create({
            data: {
                title,
                description,
                userId
            }
        });
        return res.status(201).json({ message: "Task created successfully", task: newTask });
    }
    catch (error) {
        console.error(`Create task error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const status = req.query.status;
        const whereClause = { userId };
        if (search) {
            whereClause.title = { contains: search, mode: 'insensitive' };
        }
        if (status && (status === 'PENDING' || status === 'COMPLETED')) {
            whereClause.status = status;
        }
        const tasks = await prisma_1.default.task.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma_1.default.task.count({ where: whereClause });
        return res.status(200).json({
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error(`Get tasks error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const task = await prisma_1.default.task.findFirst({
            where: { id, userId }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json({ task });
    }
    catch (error) {
        console.error(`Get task error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const { title, description, status } = req.body;
        const existingTask = await prisma_1.default.task.findFirst({
            where: { id, userId }
        });
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        const updatedTask = await prisma_1.default.task.update({
            where: { id },
            data: {
                title: title || existingTask.title,
                description: description !== undefined ? description : existingTask.description,
                status: status || existingTask.status
            }
        });
        return res.status(200).json({ message: "Task updated successfully", task: updatedTask });
    }
    catch (error) {
        console.error(`Update task error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const existingTask = await prisma_1.default.task.findFirst({
            where: { id, userId }
        });
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        await prisma_1.default.task.delete({
            where: { id }
        });
        return res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error(`Delete task error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.deleteTask = deleteTask;
const toggleTaskStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const existingTask = await prisma_1.default.task.findFirst({
            where: { id, userId }
        });
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        const newStatus = existingTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        const updatedTask = await prisma_1.default.task.update({
            where: { id },
            data: { status: newStatus }
        });
        return res.status(200).json({ message: "Task status toggled", task: updatedTask });
    }
    catch (error) {
        console.error(`Toggle task status error: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.toggleTaskStatus = toggleTaskStatus;
