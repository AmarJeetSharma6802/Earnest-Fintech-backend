import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Example API check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app