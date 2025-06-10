// Core imports
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import errorHandler from "./middleware/errorHandler.js";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import accountRouter from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// SECURITY MIDDLEWARE

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable if issues with frontend later
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  hpp({
    whitelist: ["sort", "fields", "page", "limit", "category"],
  })
);
// Body parser middleware (with size limits for security)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against XSS attacks
app.use(xss());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true, // Important for cookies
  })
);

// Serve static files (if needed)
// app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// 2) ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/transactions", transactionRoutes);

// 3) HANDLE UNDEFINED ROUTES
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
  });
});

// 4) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

export default app;
