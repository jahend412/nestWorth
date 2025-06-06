// Core imports
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import AppError from "./utils/appError.js";
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

// Rate limiting = prevents brute force attacks
const limiter = rateLimit({
  max: 100, // 100 requests per hour
  windowsMs: 60 * 60 * 1000, // 1 hour
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again in an hour!",
  },
  standardHeaders: true, // Return rate limit info in headrs
  legacyHeaders: false,
});
app.use("/api", limiter);

//  Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  max: 10,
  windowsMs: 15 * 60 * 1000,
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later!",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});
app.use("/api/v1/auth", authLimiter);

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
        : "http://localhost:3000",
    credentials: true, // Important for cookies
  })
);

// Serve static files (if needed)
// app.use(express.static(path.join(__dirname, 'public')));

// 2) ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/transactions", transactionRoutes);

// 3) HANDLE UNDEFINED ROUTES
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

export default app;
