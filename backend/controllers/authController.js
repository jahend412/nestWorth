import jwt from "jsonwebtoken";
import { User } from "../models/index";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import { promisify } from "util";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userResponse,
    },
  });
};

export const signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    },
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({
    where: { email },
    attributes: { include: ["password"] },
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // If everything ok, send token to client
  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });

  createSendToken(user, 200, res);
});

// Middleware to protect routes from unauthorized access

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.include(req.user.role)) {
      return next(
        new AppError("You do not have permission to perfom this action", 403)
      );
    }
    next();
  };
};
