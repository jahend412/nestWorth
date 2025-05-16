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

// Production error response = limited details
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log error
    console.error("ERROR", err);
    // Generic message to client
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/** SPECIFIC ERROR HANDLERS */

//  Sequelize validation error
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0].path;
  const message = `duplicate value for ${field}.  Please use another value.`;
  return new AppError(message, 400);
};
