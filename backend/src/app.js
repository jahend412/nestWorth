// Core imports
import express from "express";
import dotenv from "dotenv";
import AppError from "./utils/appError";

dotenv.config();

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("NestWorth API is up and running");
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
