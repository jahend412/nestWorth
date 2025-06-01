import express from "express";
import {
  getTransactionById,
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from "../controllers/transactionController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAllTransactions).post(createTransaction);

router.route("/summary", getTransactionSummary);

router
  .route("/:id")
  .get(getTransactionById)
  .patch(updateTransaction)
  .delete(deleteTransaction);

export default router;
