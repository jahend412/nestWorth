import express from "express";
import {
  login,
  signup,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController";

const router = express.Router();

router.get("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "This route is only for admins!",
  });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateMyPassowrd", protect, updatePassword);

export default router;
