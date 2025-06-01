import Transaction from "../models/transaction.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

class TransactionController {
  // GET /api/transactions
  static getAllTransactions = catchAsync(async (req, res, _next) => {
    const { userId } = req.user;
    const transactions = await Transaction.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  });

  // GET /api/transactions/:id
  static getTransactionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.user;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return next(new AppError("Transaction not found", 404));
    }

    // Ensure user can only access their own transactions
    if (transaction.userId !== userId) {
      return next(new AppError("Access denied", 403));
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  });

  // POST /api/transactions
  static createTransaction = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { amount, description, category, type } = req.body;

    // Basic validation
    if (!amount || !description || !category || !type) {
      return next(
        new AppError(
          "Amount, description, category, and type are required",
          400
        )
      );
    }

    if (!["income", "expense"].includes(type)) {
      return next(
        new AppError('Type must be either "income" or "expense"', 400)
      );
    }

    const transactionData = {
      ...req.body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transaction = await Transaction.create(transactionData);

    res.status(201).json({
      success: true,
      data: transaction,
      message: "Transaction created successfully",
    });
  });

  // PUT /api/transactions/:id
  static updateTransaction = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.user;

    // Check if transaction exists and belongs to user
    const existingTransaction = await Transaction.findById(id);

    if (!existingTransaction) {
      return next(new AppError("Transaction not found", 404));
    }

    if (existingTransaction.userId !== userId) {
      return next(new AppError("Access denied", 403));
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.createdAt;

    const updatedTransaction = await Transaction.update(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedTransaction,
      message: "Transaction updated successfully",
    });
  });

  // DELETE /api/transactions/:id
  static deleteTransaction = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.user;

    // Check if transaction exists and belongs to user
    const existingTransaction = await Transaction.findById(id);

    if (!existingTransaction) {
      return next(new AppError("Transaction not found", 404));
    }

    if (existingTransaction.userId !== userId) {
      return next(new AppError("Access denied", 403));
    }

    await Transaction.delete(id);

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  });

  // GET /api/transactions/summary
  static getTransactionSummary = catchAsync(async (req, res, _next) => {
    const { userId } = req.user;
    const transactions = await Transaction.findByUserId(userId);

    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += parseFloat(transaction.amount);
        } else {
          acc.totalExpenses += parseFloat(transaction.amount);
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    summary.netAmount = summary.totalIncome - summary.totalExpenses;

    res.status(200).json({
      success: true,
      data: summary,
    });
  });
}

export default TransactionController;
