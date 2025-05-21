import app from "../app.js";
import http from "http";
import process from "process";

// Set port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Global error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
