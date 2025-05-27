import express from "express";
import {
  login,
  signup,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
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
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// All routes after this are protected
router.use(protect);

router.patch("/updateMyPassowrd", updatePassword);

export default router;
