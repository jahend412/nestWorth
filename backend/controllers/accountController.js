import { Account, User } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Get all accounts for the logged-in user
export const getAllAccounts = catchAsync(async (req, res, _next) => {
  const accounts = await Account.findAll({
    where: {
      userId: req.user.id,
      isActive: true,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    status: "success",
    results: accounts.length,
    data: {
      accounts,
    },
  });
});

// Get a specific account
export const getAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id, // Ensure user owns this account
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email"],
      },
    ],
  });

  if (!account) {
    return next(new AppError("No account found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
});

// Create a new account
export const createAccount = catchAsync(async (req, res, _next) => {
  // Add the user ID from the authenticated user
  const accountData = {
    ...req.body,
    userId: req.user.id,
  };

  const newAccount = await Account.create(accountData);

  // Fetch the complete account with associations
  const account = await Account.findByPk(newAccount.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email"],
      },
    ],
  });

  res.status(201).json({
    status: "success",
    data: {
      account,
    },
  });
});

// Update an account
export const updateAccount = catchAsync(async (req, res, next) => {
  // Find account and ensure user owns it
  const account = await Account.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!account) {
    return next(new AppError("No account found with that ID", 404));
  }

  // Update account
  await account.update(req.body);

  // Fetch updated account with associations
  const updatedAccount = await Account.findByPk(account.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName", "email"],
      },
    ],
  });

  res.status(200).json({
    status: "success",
    data: {
      account: updatedAccount,
    },
  });
});

// Soft delete an account (set isActive to false)
export const deleteAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!account) {
    return next(new AppError("No account found with that ID", 404));
  }

  // Soft delete by setting isActive to false
  await account.update({ isActive: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get account summary/statistics
export const getAccountSummary = catchAsync(async (req, res, _next) => {
  const { id: userId } = req.user; // Destructuring assignment

  // Get all active accounts for the user
  const accounts = await Account.findAll({
    where: { userId, isActive: true },
  });

  // Calculate summary statistics using modern array methods
  const summary = {
    totalAccounts: accounts.length,
    totalBalance: accounts.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0
    ),
    accountsByType: accounts.reduce(
      (acc, { type }) => ({
        ...acc,
        [type]: (acc[type] || 0) + 1,
      }),
      {}
    ),
    balanceByType: accounts.reduce(
      (acc, { type, balance }) => ({
        ...acc,
        [type]: (acc[type] || 0) + parseFloat(balance),
      }),
      {}
    ),
  };

  res.status(200).json({
    status: "success",
    data: {
      summary,
    },
  });
});
