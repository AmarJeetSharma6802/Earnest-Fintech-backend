import { Request, Response } from 'express';
import prisma from '../db/prisma';


export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        userId
      }
    });

    return res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error(`Create task error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const status = req.query.status as string;

    const whereClause: any = { userId };

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    if (status && (status === 'PENDING' || status === 'COMPLETED')) {
      whereClause.status = status;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.task.count({ where: whereClause });

    return res.status(200).json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(`Get tasks error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const id = req.params.id as string;

    const task = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error(`Get task error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const id = req.params.id as string;
    const { title, description, status } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title || existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        status: status || existingTask.status
      }
    });

    return res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error(`Update task error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const id = req.params.id as string;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(`Delete task error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};

export const toggleTaskStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const id = req.params.id as string;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newStatus = existingTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: newStatus }
    });

    return res.status(200).json({ message: "Task status toggled", task: updatedTask });
  } catch (error) {
    console.error(`Toggle task status error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
};
