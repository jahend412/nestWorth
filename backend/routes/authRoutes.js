import express from "express";
import rateLimit from "express-rate-limit"; // ← Add this import
import {
  login,
  signup,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

// Auth-specific rate limiting (stricter than general API limits)
const authLimiter = rateLimit({
  max: 10, // ← Stricter limit for auth
  windowsMs: 15 * 60 * 1000, // ← 15 minutes instead of 1 hour
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later!",
  },
  skipSuccessfulRequests: true,
});

router.use(authLimiter); // ← Use router.use(), not app.use()

router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "This route is only for admins!",
  });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// All routes after this are protected
router.use(protect);

router.patch("/updateMyPassword", updatePassword);

export default router;
