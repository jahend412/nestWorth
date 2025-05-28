import express from "express";
import {
  getAccount,
  getAllAccounts,
  updateAccount,
  deleteAccount,
  getAccountSummary,
  createAccount,
} from "../controllers/accountController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route("/").get(getAllAccounts).post(createAccount);

router.get("/summary", getAccountSummary);

router.route("/:id").get(getAccount).patch(updateAccount).delete(deleteAccount);

export default router;
