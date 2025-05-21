// Core imports
import express from "express";
import dotenv from "dotenv";
import AppError from "./utils/appError";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("NestWorth API is up and running");
});

app.use("/api/v1/auth", authRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
