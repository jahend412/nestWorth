import AppError from "../utils/appError";

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or unknown error: don't leak error details
  else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message to client
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * SPECIFIC ERROR HANDLERS
 * Convert various error types to operational AppErrors
 */

// Sequelize validation error
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Sequelize unique constraint error
const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0].path;
  const message = `Duplicate value for ${field}. Please use another value.`;
  return new AppError(message, 400);
};

// Sequelize foreign key constraint error
const handleSequelizeForeignKeyConstraintError = (err) => {
  const message = `Referenced record does not exist: ${
    err.message || "Invalid foreign key"
  }`;
  return new AppError(message, 400);
};

// Database connection error
const handleConnectionError = () => {
  return new AppError(
    "Database connection error. Please try again later.",
    500
  );
};

// JWT token errors
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);
const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

// Main error handler middleware
const errorHandler = (err, req, res, _next) => {
  // Default values if not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // Create a hard copy of the error
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message; // Ensure message is preserved

    // Handle Sequelize errors
    if (err.name === "SequelizeValidationError")
      error = handleSequelizeValidationError(err);
    if (err.name === "SequelizeUniqueConstraintError")
      error = handleSequelizeUniqueConstraintError(err);
    if (err.name === "SequelizeForeignKeyConstraintError")
      error = handleSequelizeForeignKeyConstraintError(err);
    if (
      err.name === "SequelizeConnectionError" ||
      err.name === "SequelizeConnectionRefusedError"
    )
      error = handleConnectionError();

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    // Handle Syntax errors
    if (err.name === "SyntaxError")
      error = new AppError("Syntax error in request", 400);

    // Handle other common errors
    if (err.code === "LIMIT_FILE_SIZE")
      error = new AppError("File too large. Max size is 5MB.", 400);

    sendErrorProd(error, res);
  }
};

export default errorHandler;
