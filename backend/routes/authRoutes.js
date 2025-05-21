import express from "express";
import {
  login,
  signup,
  protect,
  restrictTo,
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

export default router;
